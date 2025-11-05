// models/User.js (new file)

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  contact: { type: String },
  specialization: { type: String }, // for doctors
  department: { type: String }, // for doctors
  type: { type: String, enum: ['in-house', 'on-call'] }, // for doctors
  age: { type: Number }, // for patients
  gender: { type: String }, // for patients
  address: { type: String }, // for patients
  emergencyContact: { type: String } // for patients
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
export default mongoose.models.User || mongoose.model('User', userSchema);