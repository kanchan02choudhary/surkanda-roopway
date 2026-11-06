import mongoose from 'mongoose';
const schema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
export default mongoose.model('Counter', schema);
