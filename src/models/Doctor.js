// models/Doctor.js

import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ['in-house', 'on-call'], required: true },
  availability: { type: Boolean, default: true },
  department: { type: String, required: true }
});

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);