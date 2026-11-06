import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true }, phone: { type: String, required: true }, email: { type: String, default: '' },
  subject: { type: String, default: 'Website enquiry' }, message: { type: String, required: true },
  emailStatus: { type: String, enum: ['sent', 'failed'], default: 'sent' },
}, { timestamps: true });
export default mongoose.model('Contact', schema);
