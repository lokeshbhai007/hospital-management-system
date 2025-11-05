// src/app/api/emergencies/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Emergency from '@/models/Emergency';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    let query = {};
    if (start && end) {
      query.emergencyDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    const emergencies = await Emergency.find(query)
      .populate('patientId')
      .populate('doctorId')
      .sort({ emergencyDate: -1 });
    
    return NextResponse.json(emergencies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate emergency ID
    const count = await Emergency.countDocuments();
    data.emergencyId = `EMG${String(count + 1).padStart(4, '0')}`;
    
    const emergency = await Emergency.create(data);
    await emergency.populate(['patientId', 'doctorId']);
    
    return NextResponse.json(emergency, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}