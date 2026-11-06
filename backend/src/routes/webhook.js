import { Router } from 'express';
import Booking from '../models/Booking.js';
import { verifyWebhookSignature, finalizePayment } from '../lib/payments.js';
import { mails } from '../lib/mailer.js';

const router = Router();
const byOrder = (oid) => Booking.findOne({ $or: [{ 'payment.orderId': oid }, { 'payment.orderIds': oid }] });

// Razorpay Dashboard -> Webhooks -> URL: https://<backend>/api/webhooks/razorpay  (events: payment.captured, refund.processed, refund.failed)
// Backup path: issues the ticket even if the customer closed the browser right after paying.
router.post('/', async (req, res) => {
  const raw = req.body; // Buffer (express.raw)
  if (!verifyWebhookSignature(raw, req.headers['x-razorpay-signature'])) return res.status(400).json({ message: 'Invalid signature' });
  let evt; try { evt = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ message: 'Bad payload' }); }
  try {
    if (evt.event === 'payment.captured') {
      const payment = evt.payload?.payment?.entity;
      const b = payment?.order_id && await byOrder(payment.order_id);
      if (b) { try { await finalizePayment(b, payment); } catch (e) { if (e.status !== 400) throw e; console.error('[webhook] payment mismatch', b.bookingId, e.message); } }
    } else if (evt.event === 'refund.processed' || evt.event === 'refund.failed') {
      const refund = evt.payload?.refund?.entity;
      const b = refund && await Booking.findOne({ $or: [{ 'cancellation.refundId': refund.id }, { 'payment.paymentId': refund.payment_id }] });
      if (b) {
        const ok = evt.event === 'refund.processed';
        if (ok && b.cancellation.refundStatus === 'processed') return res.json({ ok: true });
        await Booking.updateOne({ _id: b._id }, { $set: { 'cancellation.refundStatus': ok ? 'processed' : 'failed', 'cancellation.refundId': refund.id } });
        const fresh = await Booking.findById(b._id);
        if (ok) await mails.refundProcessed(fresh); else await mails.staffAlert(fresh, 'Refund failed at Razorpay', `Refund ${refund.id} failed. Please check the Razorpay dashboard.`);
      }
    }
    res.json({ ok: true });
  } catch (e) { console.error('[webhook] error', e); res.status(500).json({ message: 'Retry later' }); }
});

export default router;
