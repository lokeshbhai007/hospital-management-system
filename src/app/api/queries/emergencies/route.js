// src/app/api/queries/emergencies/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Emergency from '@/models/Emergency';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const emergencies = await Emergency.find({
      emergencyDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('patientId', 'name userId')
    .populate('doctorId', 'name specialization')
    .sort({ emergencyDate: -1 });

    // Calculate statistics
    const total = emergencies.length;
    const critical = emergencies.filter(e => e.severity === 'critical').length;
    const resolved = emergencies.filter(e => e.status === 'resolved').length;
    
    // Get unique doctors involved
    const doctorIds = [...new Set(emergencies.map(e => e.doctorId?._id).filter(id => id))];
    const activeDoctors = doctorIds.length;

    return NextResponse.json({
      emergencies,
      stats: {
        total,
        critical,
        resolved,
        activeDoctors
      }
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}