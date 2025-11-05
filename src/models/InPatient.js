// models/InPatient.js

import mongoose from 'mongoose';

const inPatientSchema = new mongoose.Schema({
  admissionId: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admissionDate: { type: Date, required: true },
  dischargeDate: { type: Date },
  roomNumber: { type: String, required: true },
  illness: { type: String, required: true },
  treatment: { type: String, required: true },
  medication: [{ type: String }],
  status: { type: String, enum: ['admitted', 'discharged'], default: 'admitted' }
}, { 
  timestamps: true,
  collection: 'inpatients'
});

export default mongoose.models.InPatient || mongoose.model('InPatient', inPatientSchema);