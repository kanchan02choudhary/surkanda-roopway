import Booking from '../models/Booking.js';
import IdDocument from '../models/IdDocument.js';
import { config } from '../config.js';
import { addDaysISO, todayIST } from './time.js';

/** ID proofs are sensitive: delete them DOC_RETENTION_DAYS after the visit date (or 7 days after cancellation). */
export async function purgeOldDocuments() {
  const cutoff = addDaysISO(todayIST(), -config.docRetentionDays);
  const cancelledBefore = new Date(Date.now() - 7 * 86400000);
  const old = await Booking.find({ 'document.docId': { $exists: true, $ne: null }, $or: [{ visitDate: { $lt: cutoff } }, { status: 'cancelled', 'cancellation.cancelledAt': { $lt: cancelledBefore } }] }).select('document.docId bookingId');
  for (const b of old) {
    await IdDocument.deleteOne({ _id: b.document.docId });
    await Booking.updateOne({ _id: b._id }, { $unset: { 'document.docId': '' }, $set: { 'document.reviewNote': b.document.reviewNote ? b.document.reviewNote : 'Document deleted (retention policy)' } });
  }
  if (old.length) console.log(`[cleanup] deleted ${old.length} ID document(s)`);
}
