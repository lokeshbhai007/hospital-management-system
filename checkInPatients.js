const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://raj052551_db_user:KHcbjuxeH9rjYR0B@cluster0.qcbc9vz.mongodb.net/anshu';

async function checkInPatients() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check inpatients collection
    const inpatientsCollection = mongoose.connection.db.collection('inpatients');
    const inpatients = await inpatientsCollection.find().toArray();
    
    console.log(`\n📊 Found ${inpatients.length} in-patient records:`);
    
    inpatients.forEach(ip => {
      console.log(`\nAdmission ID: ${ip.admissionId}`);
      console.log(`Patient ID: ${ip.patientId}`);
      console.log(`Doctor ID: ${ip.doctorId}`);
      console.log(`Status: ${ip.status}`);
      console.log(`Illness: ${ip.illness}`);
      console.log(`Room: ${ip.roomNumber}`);
    });

    // Check users collection
    const usersCollection = mongoose.connection.db.collection('users');
    const doctors = await usersCollection.find({ role: 'doctor' }).toArray();
    const patients = await usersCollection.find({ role: 'patient' }).toArray();
    
    console.log(`\n👨‍⚕️ Found ${doctors.length} doctors:`);
    doctors.slice(0, 3).forEach(doc => {
      console.log(`   - ${doc.name} (${doc.userId}) - ${doc.specialization}`);
    });
    
    console.log(`\n👥 Found ${patients.length} patients:`);
    patients.slice(0, 3).forEach(pat => {
      console.log(`   - ${pat.name} (${pat.userId})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkInPatients();