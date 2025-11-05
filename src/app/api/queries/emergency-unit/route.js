// src/app/api/queries/emergency-unit/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Emergency from '@/models/Emergency';

export async function GET() {
  try {
    await dbConnect();

    const emergencies = await Emergency.find()
      .populate('patientId', 'name userId')
      .populate('doctorId', 'name specialization type')
      .sort({ emergencyDate: -1 });

    return NextResponse.json(emergencies);
  } catch (error) {
    console.error('Error fetching emergency unit data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}