import mongoose from 'mongoose';
// ID proofs are kept in MongoDB (not local disk) so the API works on hosts with ephemeral disks (Render, Railway, etc.).
const schema = new mongoose.Schema({
  bookingId: { type: String, required: true, index: true },
  originalName: String,
  mimeType: String,
  size: Number,
  data: { type: Buffer, required: true, select: false },
}, { timestamps: true });
export default mongoose.model('IdDocument', schema);
