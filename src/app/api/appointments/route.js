// src/app/api/appointments/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    
    let query = {};
    if (doctorId) {
      query.doctorId = doctorId;
    }
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name userId age gender contact')
      .populate('doctorId', 'name userId specialization department')
      .sort({ date: -1 });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate appointment ID
    const count = await Appointment.countDocuments();
    data.appointmentId = `APT${String(count + 1).padStart(4, '0')}`;
    
    const appointment = await Appointment.create(data);
    await appointment.populate(['patientId', 'doctorId']);
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}