// seedData.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Include all models directly in the script
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

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

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

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

const InPatient = mongoose.models.InPatient || mongoose.model('InPatient', inPatientSchema);

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

const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema);

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

const Billing = mongoose.models.Billing || mongoose.model('Billing', billingSchema);

// Database connection function
async function dbConnect() {
  const MONGODB_URI = 'mongodb+srv://raj052551_db_user:KHcbjuxeH9rjYR0B@cluster0.qcbc9vz.mongodb.net/anshu';
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const opts = {
    bufferCommands: false,
  };

  try {
    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Sample data
const sampleData = {
  users: [
    // Admin
    {
      userId: 'ADM001',
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin',
      contact: '+91-9876543210'
    },
    // Doctors
    {
      userId: 'DOC001',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@hospital.com',
      password: 'password123',
      role: 'doctor',
      contact: '+91-9876543211',
      specialization: 'Cardiology',
      department: 'Cardiology',
      type: 'in-house'
    },
    {
      userId: 'DOC002',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@hospital.com',
      password: 'password123',
      role: 'doctor',
      contact: '+91-9876543212',
      specialization: 'Neurology',
      department: 'Neurology',
      type: 'in-house'
    },
    {
      userId: 'DOC003',
      name: 'Dr. Amit Patel',
      email: 'amit.patel@hospital.com',
      password: 'password123',
      role: 'doctor',
      contact: '+91-9876543213',
      specialization: 'Orthopedics',
      department: 'Orthopedics',
      type: 'on-call'
    },
    {
      userId: 'DOC004',
      name: 'Dr. Sunita Reddy',
      email: 'sunita.reddy@hospital.com',
      password: 'password123',
      role: 'doctor',
      contact: '+91-9876543214',
      specialization: 'Pediatrics',
      department: 'Pediatrics',
      type: 'in-house'
    },
    // Patients
    {
      userId: 'PAT001',
      name: 'Ramesh Singh',
      email: 'ramesh.singh@email.com',
      password: 'password123',
      role: 'patient',
      contact: '+91-9876543221',
      age: 45,
      gender: 'Male',
      address: '123 Main St, Mumbai',
      emergencyContact: '+91-9876543222'
    },
    {
      userId: 'PAT002',
      name: 'Sita Menon',
      email: 'sita.menon@email.com',
      password: 'password123',
      role: 'patient',
      contact: '+91-9876543223',
      age: 32,
      gender: 'Female',
      address: '456 Park Ave, Delhi',
      emergencyContact: '+91-9876543224'
    },
    {
      userId: 'PAT003',
      name: 'Arun Joshi',
      email: 'arun.joshi@email.com',
      password: 'password123',
      role: 'patient',
      contact: '+91-9876543225',
      age: 58,
      gender: 'Male',
      address: '789 MG Road, Bangalore',
      emergencyContact: '+91-9876543226'
    },
    {
      userId: 'PAT004',
      name: 'Meera Iyer',
      email: 'meera.iyer@email.com',
      password: 'password123',
      role: 'patient',
      contact: '+91-9876543227',
      age: 28,
      gender: 'Female',
      address: '321 Church St, Chennai',
      emergencyContact: '+91-9876543228'
    },
    {
      userId: 'PAT005',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@email.com',
      password: 'password123',
      role: 'patient',
      contact: '+91-9876543229',
      age: 65,
      gender: 'Male',
      address: '654 Marine Drive, Mumbai',
      emergencyContact: '+91-9876543230'
    }
  ],
  appointments: [
    {
      appointmentId: 'APT001',
      patientId: null,
      doctorId: null,
      date: new Date('2024-01-15'),
      time: '10:00 AM',
      type: 'regular',
      status: 'completed',
      notes: 'Regular checkup',
      patientNotes: 'Feeling better after medication',
      doctorFeedback: 'Patient responding well to treatment'
    },
    {
      appointmentId: 'APT002',
      patientId: null,
      doctorId: null,
      date: new Date('2024-01-15'),
      time: '11:30 AM',
      type: 'follow-up',
      status: 'completed',
      notes: 'Follow-up for cardiac issues',
      patientNotes: 'Occasional chest pain',
      doctorFeedback: 'Recommended ECG and blood tests'
    },
    {
      appointmentId: 'APT003',
      patientId: null,
      doctorId: null,
      date: new Date('2024-01-16'),
      time: '02:00 PM',
      type: 'regular',
      status: 'approved',
      notes: 'Neurology consultation',
      patientNotes: 'Headaches and dizziness',
      doctorFeedback: 'Scheduled for MRI scan'
    },
    {
      appointmentId: 'APT004',
      patientId: null,
      doctorId: null,
      date: new Date('2024-01-17'),
      time: '09:00 AM',
      type: 'emergency',
      status: 'completed',
      notes: 'Emergency orthopedic consultation',
      patientNotes: 'Severe back pain after fall',
      doctorFeedback: 'X-ray shows minor fracture, prescribed pain medication'
    },
    {
      appointmentId: 'APT005',
      patientId: null,
      doctorId: null,
      date: new Date('2024-01-18'),
      time: '03:30 PM',
      type: 'regular',
      status: 'pending',
      notes: 'Pediatric checkup',
      patientNotes: 'Child fever and cough',
      doctorFeedback: ''
    }
  ],
  inPatients: [
    {
      admissionId: 'ADM001',
      patientId: null,
      doctorId: null,
      admissionDate: new Date('2024-01-10'),
      dischargeDate: null,
      roomNumber: '301',
      illness: 'Severe Pneumonia',
      treatment: 'Antibiotics and oxygen therapy',
      medication: ['Amoxicillin', 'Paracetamol', 'Inhalers'],
      status: 'admitted'
    },
    {
      admissionId: 'ADM002',
      patientId: null,
      doctorId: null,
      admissionDate: new Date('2024-01-12'),
      dischargeDate: new Date('2024-01-18'),
      roomNumber: '205',
      illness: 'Cardiac Arrhythmia',
      treatment: 'Medication and monitoring',
      medication: ['Beta-blockers', 'Blood thinners'],
      status: 'discharged'
    },
    {
      admissionId: 'ADM003',
      patientId: null,
      doctorId: null,
      admissionDate: new Date('2024-01-14'),
      dischargeDate: null,
      roomNumber: '412',
      illness: 'Stroke Recovery',
      treatment: 'Physical therapy and medication',
      medication: ['Aspirin', 'Statins', 'Blood pressure medication'],
      status: 'admitted'
    }
  ],
  emergencies: [
    {
      emergencyId: 'EMG001',
      patientId: null,
      doctorId: null,
      emergencyDate: new Date('2024-01-15T08:30:00'),
      severity: 'critical',
      description: 'Patient brought in with severe chest pain and breathing difficulty',
      treatmentProvided: 'Emergency ECG, oxygen therapy, nitroglycerin administered',
      status: 'resolved'
    },
    {
      emergencyId: 'EMG002',
      patientId: null,
      doctorId: null,
      emergencyDate: new Date('2024-01-16T14:20:00'),
      severity: 'high',
      description: 'Road accident victim with multiple fractures and head injury',
      treatmentProvided: 'Stabilization, pain management, CT scan ordered',
      status: 'active'
    },
    {
      emergencyId: 'EMG003',
      patientId: null,
      doctorId: null,
      emergencyDate: new Date('2024-01-17T10:15:00'),
      severity: 'medium',
      description: 'Severe allergic reaction with swelling and breathing difficulty',
      treatmentProvided: 'Epinephrine injection, antihistamines, observation',
      status: 'resolved'
    },
    {
      emergencyId: 'EMG004',
      patientId: null,
      doctorId: null,
      emergencyDate: new Date('2024-01-18T16:45:00'),
      severity: 'low',
      description: 'Minor burn injury from kitchen accident',
      treatmentProvided: 'Burn dressing, pain medication, tetanus shot',
      status: 'active'
    }
  ],
  billings: [
    {
      billId: 'BIL001',
      patientId: null,
      appointmentId: null,
      amount: 2500,
      paymentDate: new Date('2024-01-15'),
      paymentMethod: 'card',
      services: [
        { serviceName: 'Consultation', cost: 500 },
        { serviceName: 'ECG', cost: 800 },
        { serviceName: 'Blood Tests', cost: 1200 }
      ],
      status: 'paid'
    },
    {
      billId: 'BIL002',
      patientId: null,
      appointmentId: null,
      amount: 1800,
      paymentDate: new Date('2024-01-16'),
      paymentMethod: 'cash',
      services: [
        { serviceName: 'Consultation', cost: 500 },
        { serviceName: 'X-Ray', cost: 1300 }
      ],
      status: 'paid'
    },
    {
      billId: 'BIL003',
      patientId: null,
      appointmentId: null,
      amount: 3500,
      paymentDate: new Date('2024-01-17'),
      paymentMethod: 'insurance',
      services: [
        { serviceName: 'Emergency Consultation', cost: 1000 },
        { serviceName: 'CT Scan', cost: 2500 }
      ],
      status: 'paid'
    },
    {
      billId: 'BIL004',
      patientId: null,
      appointmentId: null,
      amount: 4200,
      paymentDate: new Date('2024-01-18'),
      paymentMethod: 'card',
      services: [
        { serviceName: 'Consultation', cost: 500 },
        { serviceName: 'MRI', cost: 3200 },
        { serviceName: 'Medication', cost: 500 }
      ],
      status: 'pending'
    },
    {
      billId: 'BIL005',
      patientId: null,
      appointmentId: null,
      amount: 1500,
      paymentDate: new Date('2024-01-19'),
      paymentMethod: 'cash',
      services: [
        { serviceName: 'Follow-up Consultation', cost: 400 },
        { serviceName: 'Blood Tests', cost: 800 },
        { serviceName: 'Medication', cost: 300 }
      ],
      status: 'paid'
    }
  ]
};

async function seedDatabase() {
  try {
    await dbConnect();
    
    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await InPatient.deleteMany({});
    await Emergency.deleteMany({});
    await Billing.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Hash passwords for all users
    console.log('🔐 Hashing passwords...');
    const usersWithHashedPasswords = await Promise.all(
      sampleData.users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users and store their IDs
    const insertedUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Create maps for user IDs
    const doctorMap = new Map();
    const patientMap = new Map();

    insertedUsers.forEach(user => {
      if (user.role === 'doctor') {
        doctorMap.set(user.userId, user._id);
      } else if (user.role === 'patient') {
        patientMap.set(user.userId, user._id);
      }
    });

    // Update appointments with actual IDs
    const appointmentsWithIds = sampleData.appointments.map((appt, index) => {
      const patientIds = Array.from(patientMap.values());
      const doctorIds = Array.from(doctorMap.values());
      
      return {
        ...appt,
        patientId: patientIds[index % patientIds.length],
        doctorId: doctorIds[index % doctorIds.length]
      };
    });

    const insertedAppointments = await Appointment.insertMany(appointmentsWithIds);
    console.log(`✅ Inserted ${insertedAppointments.length} appointments`);

    // Update in-patients with actual IDs
    const inPatientsWithIds = sampleData.inPatients.map((ip, index) => {
      const patientIds = Array.from(patientMap.values());
      const doctorIds = Array.from(doctorMap.values());
      
      return {
        ...ip,
        patientId: patientIds[index % patientIds.length],
        doctorId: doctorIds[index % doctorIds.length]
      };
    });

    const insertedInPatients = await InPatient.insertMany(inPatientsWithIds);
    console.log(`✅ Inserted ${insertedInPatients.length} in-patients`);

    // Update emergencies with actual IDs
    const emergenciesWithIds = sampleData.emergencies.map((emergency, index) => {
      const patientIds = Array.from(patientMap.values());
      const doctorIds = Array.from(doctorMap.values());
      
      return {
        ...emergency,
        patientId: patientIds[index % patientIds.length],
        doctorId: doctorIds[index % doctorIds.length]
      };
    });

    const insertedEmergencies = await Emergency.insertMany(emergenciesWithIds);
    console.log(`✅ Inserted ${insertedEmergencies.length} emergencies`);

    // Update billings with actual IDs
    const billingsWithIds = sampleData.billings.map((bill, index) => {
      const patientIds = Array.from(patientMap.values());
      const appointmentIds = insertedAppointments.map(appt => appt._id);
      
      return {
        ...bill,
        patientId: patientIds[index % patientIds.length],
        appointmentId: appointmentIds[index % appointmentIds.length] || null
      };
    });

    const insertedBillings = await Billing.insertMany(billingsWithIds);
    console.log(`✅ Inserted ${insertedBillings.length} billings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   👥 Users: ${insertedUsers.length}`);
    console.log(`   📅 Appointments: ${insertedAppointments.length}`);
    console.log(`   🏥 In-Patients: ${insertedInPatients.length}`);
    console.log(`   🚨 Emergencies: ${insertedEmergencies.length}`);
    console.log(`   💰 Billings: ${insertedBillings.length}`);

    // Display some sample data for verification
    console.log('\n🔍 Sample Data Verification:');
    console.log('   Doctors:');
    insertedUsers.filter(u => u.role === 'doctor').forEach(doc => {
      console.log(`     - ${doc.name} (${doc.specialization})`);
    });
    
    console.log('\n   Patients:');
    insertedUsers.filter(u => u.role === 'patient').forEach(pat => {
      console.log(`     - ${pat.name} (${pat.age}y, ${pat.gender})`);
    });
    
    console.log('\n   Recent Appointments:');
    insertedAppointments.slice(0, 3).forEach(apt => {
      const patient = insertedUsers.find(u => u._id.equals(apt.patientId));
      const doctor = insertedUsers.find(u => u._id.equals(apt.doctorId));
      console.log(`     - ${patient?.name} with ${doctor?.name} (${apt.status})`);
    });

    console.log('\n🔑 Login Credentials (All users password: password123):');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Admin:');
    console.log('   📧 admin@hospital.com');
    console.log('   \n   Doctors:');
    console.log('   📧 rajesh.kumar@hospital.com (Cardiology)');
    console.log('   📧 priya.sharma@hospital.com (Neurology)');
    console.log('   📧 amit.patel@hospital.com (Orthopedics)');
    console.log('   📧 sunita.reddy@hospital.com (Pediatrics)');
    console.log('   \n   Patients:');
    console.log('   📧 ramesh.singh@email.com');
    console.log('   📧 sita.menon@email.com');
    console.log('   📧 arun.joshi@email.com');
    console.log('   📧 meera.iyer@email.com');
    console.log('   📧 vikram.malhotra@email.com');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();