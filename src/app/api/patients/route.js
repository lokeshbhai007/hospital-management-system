// src/app/api/patients/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    await dbConnect();
    const patients = await Patient.find().sort({ registrationDate: -1 });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate patient ID
    const count = await Patient.countDocuments();
    data.patientId = `PAT${String(count + 1).padStart(4, '0')}`;
    
    const patient = await Patient.create(data);
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}