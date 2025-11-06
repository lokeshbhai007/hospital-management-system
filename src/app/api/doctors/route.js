// src/app/api/doctors/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch only users with role 'doctor'
    const doctors = await User.find({ role: 'doctor' })
      .select('_id userId name email specialization department type contact')
      .sort({ name: 1 });
    
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields for doctor
    if (!data.name || !data.email || !data.password || !data.specialization) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, specialization' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Generate doctor ID
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const userId = `DOC${String(doctorCount + 1).padStart(4, '0')}`;
    
    // Create doctor user
    const doctor = await User.create({
      ...data,
      userId,
      role: 'doctor'
    });
    
    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    
    return NextResponse.json(doctorResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}