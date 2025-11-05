// models/Patient.js

import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
});

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema);