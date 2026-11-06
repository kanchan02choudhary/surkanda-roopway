import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import Booking, { STATUS } from '../models/Booking.js';
import IdDocument from '../models/IdDocument.js';
import { requireAdmin } from '../middleware/auth.js';
import { mails } from '../lib/mailer.js';
import { cancelBooking, startRefund } from '../lib/cancellation.js';

const router = Router();
router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
router.use(requireAdmin);

const LIST_FIELDS = 'bookingId name phone email visitDate quantity amount status document.originalName document.reviewStatus document.reviewNote document.submittedAt payment.paymentId payment.paidAt ticket.billNo cancellation emails createdAt';

router.get('/bookings', async (req, res, next) => {
  try {
    const { status, q } = req.query; const filter = {};
    if (status && Object.values(STATUS).includes(status)) filter.status = status;
    if (q) { const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 40), 'i'); filter.$or = [{ bookingId: rx }, { name: rx }, { phone: rx }, { email: rx }, { 'ticket.billNo': rx }]; }
    const rows = await Booking.find(filter).select(LIST_FIELDS).sort({ createdAt: status === STATUS.PENDING_VERIFICATION ? 1 : -1 }).limit(200).lean();
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/bookings/:bookingId/document', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.bookingId }).select('document.docId');
    const doc = b?.document?.docId && await IdDocument.findById(b.document.docId).select('+data');
    if (!doc) return res.status(404).json({ message: 'Document not found (it may have been deleted by the retention policy).' });
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName || 'id-document')}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(doc.data);
  } catch (e) { next(e); }
});

// Staff document verification: approve -> customer can pay; reject -> customer re-uploads
router.patch('/bookings/:bookingId/document', async (req, res, next) => {
  try {
    const { status, note = '' } = z.object({ status: z.enum(['approved', 'rejected']), note: z.string().trim().max(500).optional() }).parse(req.body);
    if (status === 'rejected' && note.trim().length < 3) return res.status(400).json({ message: 'Please give a short reason for rejection.' });
    const b = await Booking.findOne({ bookingId: req.params.bookingId }).select('+accessToken');
    if (!b) return res.status(404).json({ message: 'Booking not found.' });
    if (b.status !== STATUS.PENDING_VERIFICATION) return res.status(409).json({ message: `Booking is "${b.status}" — only bookings pending verification can be reviewed.` });
    b.status = status === 'approved' ? STATUS.VERIFIED : STATUS.DOCUMENT_REJECTED;
    b.document.reviewStatus = status; b.document.reviewNote = note; b.document.reviewedAt = new Date();
    await b.save();
    if (status === 'approved') await mails.documentApproved(b, b.accessToken); else await mails.documentRejected(b, b.accessToken, note);
    res.json({ message: status === 'approved' ? 'Approved. Payment link emailed to the customer.' : 'Rejected. Customer has been emailed.', bookingId: b.bookingId, status: b.status });
  } catch (e) { next(e); }
});

// Operational cancellation (weather closure etc.) — ignores the customer cutoff, full refund unless refundPercent given
router.post('/bookings/:bookingId/cancel', async (req, res, next) => {
  try {
    const { reason, refundPercent } = z.object({ reason: z.string().trim().min(3).max(300), refundPercent: z.number().min(0).max(100).optional() }).parse(req.body);
    const b = await cancelBooking(req.params.bookingId, { by: 'admin', reason, force: true, refundPercent });
    res.json({ message: 'Booking cancelled.', status: b.status, cancellation: b.cancellation });
  } catch (e) { next(e); }
});

router.post('/bookings/:bookingId/retry-refund', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!b || b.status !== STATUS.CANCELLED || b.cancellation?.refundStatus !== 'failed') return res.status(409).json({ message: 'No failed refund to retry for this booking.' });
    await startRefund(b);
    const fresh = await Booking.findById(b._id);
    res.json({ message: fresh.cancellation.refundStatus === 'failed' ? `Refund failed again: ${fresh.cancellation.refundError}` : 'Refund initiated.', refundStatus: fresh.cancellation.refundStatus });
  } catch (e) { next(e); }
});

export default router;
