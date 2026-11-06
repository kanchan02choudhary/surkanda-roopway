import mongoose from 'mongoose';

export const STATUS = {
  PENDING_VERIFICATION: 'pending_verification', // document uploaded, waiting for staff review
  DOCUMENT_REJECTED: 'document_rejected',       // staff rejected, customer can re-upload
  VERIFIED: 'verified',                          // document approved -> payment allowed
  PAYMENT_PENDING: 'payment_pending',            // Razorpay order created
  PAID: 'paid',                                  // ticket issued
  CANCELLED: 'cancelled',
};

const emailLog = new mongoose.Schema({ type: String, to: String, status: { type: String, enum: ['sent', 'failed', 'skipped'] }, resendId: String, error: String, at: { type: Date, default: Date.now } }, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  accessToken: { type: String, required: true, select: false }, // secret in the e-mail links
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  visitDate: { type: String, required: true, index: true }, // YYYY-MM-DD (IST)
  quantity: { type: Number, required: true, min: 1, max: 20 },
  amount: { type: Number, required: true }, // paise, GST inclusive
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: Object.values(STATUS), default: STATUS.PENDING_VERIFICATION, index: true },

  document: {
    docId: mongoose.Schema.Types.ObjectId,
    originalName: String, mimeType: String, size: Number,
    submittedAt: Date, reviewedAt: Date, reviewNote: String,
    reviewStatus: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
  },

  payment: {
    orderId: String, orderIds: [String], paymentId: String, paidAt: Date, method: String,
  },

  ticket: { billNo: String, billSeq: Number, issuedAt: Date },

  cancellation: {
    cancelledAt: Date, by: { type: String, enum: ['customer', 'admin', 'system'] }, reason: String,
    refundAmount: Number, refundPercent: Number, refundId: String,
    refundStatus: { type: String, enum: ['none', 'initiated', 'processed', 'failed'], default: 'none' },
    refundError: String,
  },

  ticketSentAt: Date,
  emails: [emailLog],
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
