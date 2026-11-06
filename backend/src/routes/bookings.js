import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import Booking, { STATUS } from '../models/Booking.js';
import IdDocument from '../models/IdDocument.js';
import { config } from '../config.js';
import { upload, hasValidFileSignature } from '../middleware/upload.js';
import { loadBooking } from '../middleware/auth.js';
import { addDaysISO, istParts, todayIST } from '../lib/time.js';
import { computeBreakdown, rupees } from '../lib/pricing.js';
import { mails } from '../lib/mailer.js';
import { buildTicket, ticketPdf } from '../lib/ticket.js';
import { finalizePayment, gateway, verifyCheckoutSignature } from '../lib/payments.js';
import { cancelBooking, cancellationPolicy } from '../lib/cancellation.js';

const router = Router();
const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many booking attempts. Please try again later.' } });
const linkLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests. Please try again later.' } });

const input = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  email: z.string().trim().email('Enter a valid email.'),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid visit date.'),
  quantity: z.coerce.number().int().min(1).max(config.pricing.maxQty),
});

const maskEmail = (e = '') => e.replace(/^(.).*(@.*)$/, '$1•••$2');
const newBookingId = () => { const p = istParts(); return `SR${String(p.y).slice(-2)}${p.m}${p.d}${crypto.randomBytes(3).toString('hex').toUpperCase()}`; };

async function present(b) {
  const out = {
    bookingId: b.bookingId, name: b.name, email: maskEmail(b.email), visitDate: b.visitDate, quantity: b.quantity,
    amount: b.amount, status: b.status, createdAt: b.createdAt,
    breakdown: computeBreakdown(b.quantity),
    document: { originalName: b.document?.originalName, reviewStatus: b.document?.reviewStatus, reviewNote: b.document?.reviewNote },
    cancellation: b.status === STATUS.CANCELLED ? b.cancellation : undefined,
    policy: b.status === STATUS.CANCELLED ? undefined : cancellationPolicy(b),
  };
  if (b.status === STATUS.PAID) {
    const t = await buildTicket(b);
    out.ticket = { billNo: t.billNo, issuedAt: t.issuedAt, lines: t.lines, qrDataUrl: t.qrDataUrl, paymentId: b.payment?.paymentId };
  }
  return out;
}

router.get('/config', (_, res) => {
  const p = config.pricing; const c = config.cancellation;
  res.json({
    pricePaise: p.pricePaise, gstPercent: p.gstPercent, maxQty: p.maxQty, itemName: p.itemName, maxAdvanceDays: p.maxAdvanceDays,
    breakdownPerTicket: computeBreakdown(1), today: todayIST(), maxDate: addDaysISO(todayIST(), p.maxAdvanceDays),
    cancellation: { cutoffHours: c.cutoffHours, refundPercent: c.refundPercent },
  });
});

// 1) Customer submits details + ID document. No payment yet.
router.post('/', createLimiter, upload.single('idDocument'), async (req, res, next) => {
  try {
    const data = input.parse(req.body);
    const today = todayIST();
    if (data.visitDate < today) return res.status(400).json({ message: 'Visit date cannot be in the past.' });
    if (data.visitDate > addDaysISO(today, config.pricing.maxAdvanceDays)) return res.status(400).json({ message: `Bookings open only ${config.pricing.maxAdvanceDays} days in advance.` });
    if (!req.file) return res.status(400).json({ message: 'Please upload a valid ID document (PDF, JPG or PNG, max 5 MB).' });
    if (!hasValidFileSignature(req.file)) return res.status(400).json({ message: 'The uploaded file is not a valid PDF, JPG or PNG.' });

    const bookingId = newBookingId();
    const accessToken = crypto.randomBytes(24).toString('hex');
    const doc = await IdDocument.create({ bookingId, originalName: req.file.originalname.slice(0, 120), mimeType: req.file.mimetype, size: req.file.size, data: req.file.buffer });
    const booking = await Booking.create({
      ...data, bookingId, accessToken, amount: config.pricing.pricePaise * data.quantity,
      status: STATUS.PENDING_VERIFICATION,
      document: { docId: doc._id, originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size, submittedAt: new Date(), reviewStatus: 'pending_review' },
    });
    await mails.bookingReceived(booking, accessToken);
    res.status(201).json({ bookingId, accessToken, message: 'Booking request received. We will email you once your document is verified.' });
  } catch (e) { next(e); }
});

// Lost the e-mail? Send the private link again (only to the e-mail address on the booking; always same response).
router.post('/resend-link', linkLimiter, async (req, res, next) => {
  try {
    const { bookingId, email } = z.object({ bookingId: z.string().trim().min(6).max(40), email: z.string().trim().email() }).parse(req.body);
    const b = await Booking.findOne({ bookingId, email: email.toLowerCase() }).select('+accessToken');
    if (b) await mails.resendLink(b, b.accessToken);
    res.json({ message: 'If the details match, a link has been sent to the booking email.' });
  } catch (e) { next(e); }
});

router.get('/:bookingId', loadBooking, async (req, res, next) => { try { res.json(await present(req.booking)); } catch (e) { next(e); } });

// Re-upload after rejection
router.put('/:bookingId/document', loadBooking, upload.single('idDocument'), async (req, res, next) => {
  try {
    const b = req.booking;
    if (b.status !== STATUS.DOCUMENT_REJECTED) return res.status(409).json({ message: 'A new document can be uploaded only after a rejection.' });
    if (!req.file || !hasValidFileSignature(req.file)) return res.status(400).json({ message: 'Please upload a valid PDF, JPG or PNG (max 5 MB).' });
    await IdDocument.deleteMany({ bookingId: b.bookingId });
    const doc = await IdDocument.create({ bookingId: b.bookingId, originalName: req.file.originalname.slice(0, 120), mimeType: req.file.mimetype, size: req.file.size, data: req.file.buffer });
    b.document = { docId: doc._id, originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size, submittedAt: new Date(), reviewStatus: 'pending_review' };
    b.status = STATUS.PENDING_VERIFICATION; await b.save();
    await mails.bookingReceived(b, req.token);
    res.json({ message: 'New document submitted for verification.' });
  } catch (e) { next(e); }
});

// 2) Payment is only possible after staff approved the document.
router.post('/:bookingId/pay', loadBooking, async (req, res, next) => {
  try {
    const b = req.booking;
    if (b.status === STATUS.PAID) return res.status(409).json({ message: 'This booking is already paid.' });
    if (![STATUS.VERIFIED, STATUS.PAYMENT_PENDING].includes(b.status)) return res.status(409).json({ message: 'Payment is available only after your document is verified.' });
    if (b.visitDate < todayIST()) return res.status(409).json({ message: 'The visit date has passed.' });

    const rz = gateway();
    let orderId = b.payment?.orderId;
    if (orderId) {
      try {
        const existing = await rz.orders.fetch(orderId);
        if (existing.status === 'paid') {
          const list = await rz.orders.fetchPayments(orderId);
          const captured = list.items?.find((p) => p.status === 'captured');
          if (captured) { const r = await finalizePayment(b, captured); return res.json({ alreadyPaid: true, message: 'Payment already received.', bookingId: r.booking.bookingId }); }
        }
        if (existing.amount !== b.amount) orderId = null;
      } catch { orderId = null; }
    }
    if (!orderId) {
      const order = await rz.orders.create({ amount: b.amount, currency: 'INR', receipt: b.bookingId, notes: { bookingId: b.bookingId, visitDate: b.visitDate } });
      orderId = order.id;
      await Booking.updateOne({ _id: b._id }, { $set: { status: STATUS.PAYMENT_PENDING, 'payment.orderId': orderId }, $addToSet: { 'payment.orderIds': orderId } });
    } else if (b.status !== STATUS.PAYMENT_PENDING) {
      await Booking.updateOne({ _id: b._id }, { $set: { status: STATUS.PAYMENT_PENDING } });
    }
    res.json({ keyId: config.razorpay.keyId, orderId, amount: b.amount, currency: 'INR', bookingId: b.bookingId, name: b.name, email: b.email, phone: b.phone });
  } catch (e) { next(e); }
});

router.post('/:bookingId/verify-payment', loadBooking, async (req, res, next) => {
  try {
    const d = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() }).parse(req.body);
    if (!verifyCheckoutSignature(d.razorpay_order_id, d.razorpay_payment_id, d.razorpay_signature)) return res.status(400).json({ message: 'Payment signature verification failed.' });
    const b = req.booking;
    const known = [b.payment?.orderId, ...(b.payment?.orderIds || [])];
    if (!known.includes(d.razorpay_order_id)) return res.status(404).json({ message: 'Order does not belong to this booking.' });
    const payment = await gateway().payments.fetch(d.razorpay_payment_id); // confirm with Razorpay, not only the browser signature
    const r = await finalizePayment(b, payment);
    res.json({
      message: r.emailSent === false ? 'Payment verified. Your ticket is ready below; the email is delayed — you can download it from this page.' : 'Payment verified. Your e-ticket has been emailed.',
      bookingId: b.bookingId, emailSent: r.emailSent ?? Boolean(r.booking.ticketSentAt),
    });
  } catch (e) { next(e); }
});

// 3) Cancel (free before payment, policy-based refund after payment)
router.post('/:bookingId/cancel', loadBooking, async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().trim().max(300).optional() }).parse(req.body || {});
    const b = await cancelBooking(req.booking.bookingId, { by: 'customer', reason });
    res.json({ message: b.cancellation.refundAmount > 0 ? `Booking cancelled. Refund of ₹${rupees(b.cancellation.refundAmount)} has been initiated.` : 'Booking cancelled.', status: b.status, cancellation: b.cancellation });
  } catch (e) { next(e); }
});

router.get('/:bookingId/ticket.pdf', loadBooking, async (req, res, next) => {
  try {
    if (req.booking.status !== STATUS.PAID) return res.status(409).json({ message: 'Ticket is available after successful payment.' });
    const t = await buildTicket(req.booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Surkanda-Ropeway-Ticket-${t.billNo}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(await ticketPdf(t));
  } catch (e) { next(e); }
});

export default router;
