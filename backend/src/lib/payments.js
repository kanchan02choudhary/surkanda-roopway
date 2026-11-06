import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking, { STATUS } from '../models/Booking.js';
import { config } from '../config.js';
import { nextBillNo } from './billing.js';
import { mails } from './mailer.js';

let rzp;
export const gateway = () => (rzp ||= new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret }));

const safeEqual = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

export function verifyCheckoutSignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac('sha256', config.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, String(signature || '').toLowerCase());
}
export function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto.createHmac('sha256', config.razorpay.webhookSecret).update(rawBody).digest('hex');
  return safeEqual(expected, signature || '');
}

/**
 * Idempotent: called from the browser verify route AND the webhook. Only the first caller issues the ticket.
 * `payment` is the Razorpay payment entity (already fetched from Razorpay, never trusted from the browser).
 */
export async function finalizePayment(booking, payment) {
  const orderIds = [booking.payment?.orderId, ...(booking.payment?.orderIds || [])].filter(Boolean);
  if (!orderIds.includes(payment.order_id) || payment.amount !== booking.amount || payment.currency !== 'INR' || payment.status !== 'captured') {
    const err = new Error('Payment is not captured or amount does not match.'); err.status = 400; throw err;
  }
  const token = (await Booking.findById(booking._id).select('+accessToken')).accessToken;
  const now = new Date();

  const claimed = await Booking.findOneAndUpdate(
    { _id: booking._id, status: { $in: [STATUS.VERIFIED, STATUS.PAYMENT_PENDING] } },
    { $set: { status: STATUS.PAID, 'payment.paymentId': payment.id, 'payment.paidAt': now, 'payment.method': payment.method } },
    { new: true },
  );
  if (!claimed) {
    const current = await Booking.findById(booking._id);
    if (current.status === STATUS.CANCELLED && !current.cancellation?.refundId && current.payment?.paymentId !== payment.id) {
      // Customer cancelled while the payment was in flight -> money was taken for a cancelled booking: refund in full.
      await mails.staffAlert(current, 'Payment received on a cancelled booking', `Payment ${payment.id} was captured after cancellation. Auto-refund attempted.`);
      try { await gateway().payments.refund(payment.id, { notes: { bookingId: current.bookingId, reason: 'Paid after cancellation' } }); } catch (e) { console.error('auto-refund failed', e.message); }
    }
    return { booking: current, alreadyProcessed: true };
  }

  const { billNo, seq } = await nextBillNo(now);
  claimed.ticket = { billNo, billSeq: seq, issuedAt: now };
  await claimed.save();
  const mail = await mails.ticket(claimed, token);
  if (mail.status === 'sent') await Booking.updateOne({ _id: claimed._id }, { $set: { ticketSentAt: new Date() } });
  return { booking: await Booking.findById(claimed._id), alreadyProcessed: false, emailSent: mail.status === 'sent' };
}
