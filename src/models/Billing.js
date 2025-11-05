// models/Billing.js

import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  billId: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'card', 'insurance'], required: true },
  services: [{
    serviceName: String,
    cost: Number
  }],
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' }
}, { 
  timestamps: true,
  collection: 'billings'
});

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.Billing) {
  delete mongoose.models.Billing;
}

const Billing = mongoose.model('Billing', billingSchema);
export default Billing;