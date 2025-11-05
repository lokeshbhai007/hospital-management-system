// src/app/api/doctors/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    await dbConnect();
    const doctors = await Doctor.find().sort({ name: 1 });
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate doctor ID
    const count = await Doctor.countDocuments();
    data.doctorId = `DOC${String(count + 1).padStart(4, '0')}`;
    
    const doctor = await Doctor.create(data);
    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}