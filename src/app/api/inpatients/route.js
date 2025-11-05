// src/app/api/inpatients/route.js


import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InPatient from '@/models/InPatient';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    
    let query = {};
    if (doctorId) {
      query.doctorId = doctorId;
    }
    
    const inPatients = await InPatient.find(query)
      .populate('patientId')
      .populate('doctorId')
      .sort({ admissionDate: -1 });
    
    return NextResponse.json(inPatients);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate admission ID
    const count = await InPatient.countDocuments();
    data.admissionId = `ADM${String(count + 1).padStart(4, '0')}`;
    
    const inPatient = await InPatient.create(data);
    await inPatient.populate(['patientId', 'doctorId']);
    
    return NextResponse.json(inPatient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}