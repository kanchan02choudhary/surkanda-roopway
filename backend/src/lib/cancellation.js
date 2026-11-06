import Booking, { STATUS } from '../models/Booking.js';
import { config } from '../config.js';
import { visitDayStart } from './time.js';
import { gateway } from './payments.js';
import { mails } from './mailer.js';

/** What would happen if this booking were cancelled right now (used by the UI and the cancel route). */
export function cancellationPolicy(b, now = new Date()) {
  if (b.status === STATUS.CANCELLED) return { allowed: false, reason: 'Already cancelled.' };
  const unpaid = [STATUS.PENDING_VERIFICATION, STATUS.DOCUMENT_REJECTED, STATUS.VERIFIED, STATUS.PAYMENT_PENDING].includes(b.status);
  if (unpaid) return { allowed: true, refundAmount: 0, refundPercent: 0, note: 'No payment has been taken.' };
  const cutoff = new Date(visitDayStart(b.visitDate).getTime() - config.cancellation.cutoffHours * 3600 * 1000);
  if (now >= cutoff) return { allowed: false, reason: `Online cancellation closes ${config.cancellation.cutoffHours} hours before the visit date. Please contact the ticket desk.`, cutoff };
  const pct = config.cancellation.refundPercent;
  return { allowed: true, refundPercent: pct, refundAmount: Math.round((b.amount * pct) / 100), cutoff };
}

/**
 * Cancels once (atomic status change), refunds through Razorpay when applicable, then e-mails the customer.
 * opts: { by:'customer'|'admin', reason, force (admin: ignore cutoff), refundPercent (admin override) }
 */
export async function cancelBooking(bookingId, opts = {}) {
  const booking = await Booking.findOne({ bookingId }).select('+accessToken');
  if (!booking) { const e = new Error('Booking not found.'); e.status = 404; throw e; }
  const policy = cancellationPolicy(booking);
  if (!policy.allowed && !(opts.force && booking.status === STATUS.PAID)) { const e = new Error(policy.reason); e.status = 409; throw e; }

  const wasPaid = booking.status === STATUS.PAID;
  let refundPercent = wasPaid ? (opts.refundPercent ?? (opts.force ? 100 : policy.refundPercent)) : 0;
  refundPercent = Math.min(100, Math.max(0, Number(refundPercent)));
  const refundAmount = wasPaid ? Math.round((booking.amount * refundPercent) / 100) : 0;

  const claimed = await Booking.findOneAndUpdate(
    { _id: booking._id, status: booking.status },
    { $set: { status: STATUS.CANCELLED, 'cancellation.cancelledAt': new Date(), 'cancellation.by': opts.by || 'customer', 'cancellation.reason': (opts.reason || '').slice(0, 300), 'cancellation.refundAmount': refundAmount, 'cancellation.refundPercent': refundPercent, 'cancellation.refundStatus': 'none' } },
    { new: true },
  );
  if (!claimed) { const e = new Error('Booking changed while cancelling. Please refresh and try again.'); e.status = 409; throw e; }

  if (wasPaid && refundAmount > 0) await startRefund(claimed);
  const fresh = await Booking.findById(claimed._id);
  await mails.cancelled(fresh, booking.accessToken);
  return fresh;
}

export async function startRefund(booking) {
  try {
    const refund = await gateway().payments.refund(booking.payment.paymentId, {
      amount: booking.cancellation.refundAmount, speed: 'normal', receipt: `RF-${booking.bookingId}`.slice(0, 40),
      notes: { bookingId: booking.bookingId, reason: booking.cancellation.reason || 'Booking cancelled' },
    });
    await Booking.updateOne({ _id: booking._id }, { $set: { 'cancellation.refundId': refund.id, 'cancellation.refundStatus': refund.status === 'processed' ? 'processed' : 'initiated', 'cancellation.refundError': '' } });
  } catch (e) {
    const msg = e?.error?.description || e.message || 'Refund failed';
    console.error('Refund failed', booking.bookingId, msg);
    await Booking.updateOne({ _id: booking._id }, { $set: { 'cancellation.refundStatus': 'failed', 'cancellation.refundError': msg } });
    booking.cancellation.refundStatus = 'failed';
    await mails.staffAlert(booking, 'Refund failed – manual action needed', `Razorpay refund for payment ${booking.payment.paymentId} failed: ${msg}. Retry from the admin panel or refund from the Razorpay dashboard.`);
  }
}
