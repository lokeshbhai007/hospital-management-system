// models/Emergency.js

import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  emergencyId: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emergencyDate: { type: Date, default: Date.now },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  description: { type: String, required: true },
  treatmentProvided: { type: String },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema);