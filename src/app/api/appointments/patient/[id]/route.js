// src/app/api/appointments/patient/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const appointments = await Appointment.find({ patientId: id })
      .populate('doctorId', 'name specialization department')
      .sort({ date: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}