// src/app/api/queries/in-patients/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InPatient from '@/models/InPatient';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    let query = { status: 'admitted' };
    if (doctorId) {
      query.doctorId = doctorId;
    }

    const inPatients = await InPatient.find(query)
      .populate('patientId', 'name userId age gender contact')
      .populate('doctorId', 'name specialization department')
      .sort({ admissionDate: -1 });

    return NextResponse.json(inPatients);
  } catch (error) {
    console.error('Error fetching in-patients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}