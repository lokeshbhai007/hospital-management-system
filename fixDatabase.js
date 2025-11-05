const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://raj052551_db_user:KHcbjuxeH9rjYR0B@cluster0.qcbc9vz.mongodb.net/anshu';

// Clear any existing models to prevent OverwriteModelError
mongoose.models = {};
mongoose.modelSchemas = {};

// Define schemas
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  contact: { type: String },
  specialization: { type: String },
  department: { type: String },
  type: { type: String, enum: ['in-house', 'on-call'] },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  emergencyContact: { type: String }
}, { 
  timestamps: true,
  collection: 'users' // Explicit collection name
});

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
}, { 
  timestamps: true,
  collection: 'appointments'
});

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

// Create models with explicit names
const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Billing = mongoose.model('Billing', billingSchema);

async function fixDatabase() {
  try {
    console.log('🔧 Starting database fix...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all collections completely
    console.log('\n🗑️ Dropping all collections...');
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`   ✅ Dropped: ${collection.collectionName}`);
    }

    // Create fresh data
    console.log('\n👥 Creating fresh data...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create users array
    const users = [
      // Admin
      {
        userId: 'ADM0001',
        name: 'Raj Admin',
        email: 'admin@hospital.com',
        password: hashedPassword,
        role: 'admin',
        contact: '9876543210'
      },
      // Doctors
      {
        userId: 'DOC0001',
        name: 'Dr. Amit Verma',
        email: 'dr.amit@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        contact: '9876543251',
        specialization: 'Cardiology',
        department: 'Cardiology',
        type: 'in-house'
      },
      {
        userId: 'DOC0002',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        contact: '9876543252',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        type: 'in-house'
      },
      {
        userId: 'DOC0003',
        name: 'Dr. Rohit Kumar',
        email: 'dr.rohit@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        contact: '9876543253',
        specialization: 'Orthopedics',
        department: 'Orthopedics',
        type: 'on-call'
      },
      // Patients
      {
        userId: 'PAT0001',
        name: 'Anjali Singh',
        email: 'anjali@gmail.com',
        password: hashedPassword,
        role: 'patient',
        contact: '9876543201',
        age: 28,
        gender: 'Female',
        address: '123 MG Road, Mumbai',
        emergencyContact: '9123456701'
      },
      {
        userId: 'PAT0002',
        name: 'Rahul Gupta',
        email: 'rahul@gmail.com',
        password: hashedPassword,
        role: 'patient',
        contact: '9876543202',
        age: 35,
        gender: 'Male',
        address: '456 Park Street, Delhi',
        emergencyContact: '9123456702'
      },
      {
        userId: 'PAT0003',
        name: 'Sneha Reddy',
        email: 'sneha@gmail.com',
        password: hashedPassword,
        role: 'patient',
        contact: '9876543203',
        age: 42,
        gender: 'Female',
        address: '789 Gandhi Nagar, Bangalore',
        emergencyContact: '9123456703'
      },
      {
        userId: 'PAT0004',
        name: 'Vikram Patel',
        email: 'vikram@gmail.com',
        password: hashedPassword,
        role: 'patient',
        contact: '9876543204',
        age: 31,
        gender: 'Male',
        address: '321 Nehru Place, Chennai',
        emergencyContact: '9123456704'
      },
      {
        userId: 'PAT0005',
        name: 'Priya Joshi',
        email: 'priya.j@gmail.com',
        password: hashedPassword,
        role: 'patient',
        contact: '9876543205',
        age: 26,
        gender: 'Female',
        address: '654 Main Road, Kolkata',
        emergencyContact: '9123456705'
      }
    ];

    // Insert users
    console.log('   Inserting users...');
    const insertedUsers = await User.insertMany(users);
    console.log(`   ✅ Inserted ${insertedUsers.length} users`);

    // Create appointments
    console.log('\n📅 Creating appointments...');
    const patients = insertedUsers.filter(u => u.role === 'patient');
    const doctors = insertedUsers.filter(u => u.role === 'doctor');

    const appointments = [
      {
        appointmentId: 'APT0001',
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: new Date('2024-01-15'),
        time: '10:00 AM',
        type: 'regular',
        status: 'approved',
        patientNotes: 'Routine health checkup',
        doctorFeedback: 'Appointment confirmed'
      },
      {
        appointmentId: 'APT0002',
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        date: new Date('2024-01-16'),
        time: '2:30 PM',
        type: 'follow-up',
        status: 'pending',
        patientNotes: 'Follow-up for diabetes treatment',
        doctorFeedback: ''
      },
      {
        appointmentId: 'APT0003',
        patientId: patients[2]._id,
        doctorId: doctors[2]._id,
        date: new Date('2024-01-17'),
        time: '11:00 AM',
        type: 'emergency',
        status: 'approved',
        patientNotes: 'Severe chest pain',
        doctorFeedback: 'Emergency appointment approved'
      },
      {
        appointmentId: 'APT0004',
        patientId: patients[3]._id,
        doctorId: doctors[0]._id,
        date: new Date('2024-01-18'),
        time: '3:00 PM',
        type: 'regular',
        status: 'completed',
        patientNotes: 'Annual physical examination',
        doctorFeedback: 'Checkup completed successfully'
      },
      {
        appointmentId: 'APT0005',
        patientId: patients[4]._id,
        doctorId: doctors[1]._id,
        date: new Date('2024-01-19'),
        time: '9:30 AM',
        type: 'regular',
        status: 'approved',
        patientNotes: 'Vaccination required',
        doctorFeedback: 'Vaccination scheduled'
      }
    ];

    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(`   ✅ Inserted ${insertedAppointments.length} appointments`);

    // Create billing records
    console.log('\n💰 Creating billing records...');
    const billingRecords = [
      {
        billId: 'BIL0001',
        patientId: patients[0]._id,
        appointmentId: insertedAppointments[0]._id,
        amount: 1500,
        paymentDate: new Date('2024-01-15'),
        paymentMethod: 'cash',
        services: [
          { serviceName: 'Consultation Fee', cost: 500 },
          { serviceName: 'Blood Test', cost: 1000 }
        ],
        status: 'paid'
      },
      {
        billId: 'BIL0002',
        patientId: patients[1]._id,
        appointmentId: insertedAppointments[1]._id,
        amount: 800,
        paymentDate: new Date('2024-01-16'),
        paymentMethod: 'card',
        services: [
          { serviceName: 'Consultation Fee', cost: 500 },
          { serviceName: 'Medication', cost: 300 }
        ],
        status: 'paid'
      },
      {
        billId: 'BIL0003',
        patientId: patients[2]._id,
        appointmentId: insertedAppointments[2]._id,
        amount: 3500,
        paymentDate: new Date('2024-01-17'),
        paymentMethod: 'insurance',
        services: [
          { serviceName: 'Emergency Fee', cost: 1000 },
          { serviceName: 'X-Ray', cost: 1500 },
          { serviceName: 'Medication', cost: 1000 }
        ],
        status: 'paid'
      },
      {
        billId: 'BIL0004',
        patientId: patients[3]._id,
        appointmentId: insertedAppointments[3]._id,
        amount: 2000,
        paymentDate: new Date('2024-01-18'),
        paymentMethod: 'cash',
        services: [
          { serviceName: 'Consultation Fee', cost: 500 },
          { serviceName: 'Full Body Checkup', cost: 1500 }
        ],
        status: 'pending'
      },
      {
        billId: 'BIL0005',
        patientId: patients[4]._id,
        appointmentId: insertedAppointments[4]._id,
        amount: 1200,
        paymentDate: new Date('2024-01-19'),
        paymentMethod: 'card',
        services: [
          { serviceName: 'Consultation Fee', cost: 500 },
          { serviceName: 'Vaccination', cost: 700 }
        ],
        status: 'paid'
      }
    ];

    const insertedBilling = await Billing.insertMany(billingRecords);
    console.log(`   ✅ Inserted ${insertedBilling.length} billing records`);

    // Final summary
    console.log('\n🎉 DATABASE FIX COMPLETED!');
    console.log('========================');
    console.log(`👑 Admin: ${insertedUsers.filter(u => u.role === 'admin').length}`);
    console.log(`👨‍⚕️ Doctors: ${insertedUsers.filter(u => u.role === 'doctor').length}`);
    console.log(`👥 Patients: ${insertedUsers.filter(u => u.role === 'patient').length}`);
    console.log(`📅 Appointments: ${insertedAppointments.length}`);
    console.log(`💰 Billing Records: ${insertedBilling.length}`);
    
    const totalRevenue = insertedBilling.reduce((sum, bill) => sum + bill.amount, 0);
    console.log(`💵 Total Revenue: ₹${totalRevenue}`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log('All accounts use password: password123');
    console.log('Admin: admin@hospital.com');
    console.log('Doctors: dr.amit@hospital.com, dr.priya@hospital.com, dr.rohit@hospital.com');
    console.log('Patients: anjali@gmail.com, rahul@gmail.com, sneha@gmail.com, vikram@gmail.com, priya.j@gmail.com');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    if (error.code === 11000) {
      console.log('Duplicate key error - trying to insert duplicate data');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

fixDatabase();