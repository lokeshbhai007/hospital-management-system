// src/app/api/doctors/[id]/patients/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let query = { doctorId: id };
    if (date) {
      query.date = { $gte: new Date(date) };
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId')
      .populate('doctorId')
      .sort({ date: -1 });
    
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}