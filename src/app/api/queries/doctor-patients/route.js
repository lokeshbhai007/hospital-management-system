// src/app/api/queries/doctor-patients/route.js

// src/app/api/queries/doctor-patients/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json({ error: 'Doctor ID and date are required' }, { status: 400 });
    }

    // Start date: beginning of the provided date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // End date: current date and time
    const endDate = new Date();

    const appointments = await Appointment.find({
      doctorId: doctorId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('patientId', 'name userId age gender contact')
    .populate('doctorId', 'name specialization')
    .sort({ date: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}