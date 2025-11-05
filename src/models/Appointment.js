// models/Appointment.js

import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['regular', 'follow-up', 'emergency'], default: 'regular' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  patientNotes: { type: String },
  doctorFeedback: { type: String }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);