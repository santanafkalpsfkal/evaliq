import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: Number },
  action: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  userAgent: { type: String },
  ip: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Evitar OverwriteModelError en hot-reload
export const Log = mongoose.models.Log || mongoose.model('Log', logSchema);