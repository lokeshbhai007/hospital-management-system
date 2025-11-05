const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://raj052551_db_user:KHcbjuxeH9rjYR0B@cluster0.qcbc9vz.mongodb.net/anshu';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', new mongoose.Schema({}));
    const Billing = mongoose.models.Billing || mongoose.model('Billing', new mongoose.Schema({}));

    const users = await User.find();
    const appointments = await Appointment.find();
    const billing = await Billing.find();

    console.log('\n📊 DATABASE SUMMARY:');
    console.log('===================');
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`   - Patients: ${users.filter(u => u.role === 'patient').length}`);
    console.log(`   - Doctors: ${users.filter(u => u.role === 'doctor').length}`);
    console.log(`   - Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(`💰 Billing Records: ${billing.length}`);
    console.log(`   - Total Revenue: ₹${billing.reduce((sum, bill) => sum + (bill.amount || 0), 0)}`);

    // Check if data looks correct
    console.log('\n🔍 SAMPLE DATA:');
    console.log('First 3 users:', users.slice(0, 3).map(u => ({ name: u.name, role: u.role, email: u.email })));
    console.log('First 3 appointments:', appointments.slice(0, 3).map(a => ({ patient: a.patientId, doctor: a.doctorId, status: a.status })));
    console.log('First 3 billing records:', billing.slice(0, 3).map(b => ({ amount: b.amount, status: b.status })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();