
import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true, min: 1, max: 10 },
}, { timestamps: true });

export default mongoose.model('Claim', claimSchema);
