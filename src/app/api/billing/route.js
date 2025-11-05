// src/app/api/billing/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Billing from '@/models/Billing';

export async function GET() {
  try {
    await dbConnect();
    console.log('Fetching billing data...');
    
    const bills = await Billing.find()
      .populate('patientId', 'name userId')
      .populate('appointmentId', 'appointmentId date')
      .sort({ paymentDate: -1 });
    
    console.log(`Found ${bills.length} billing records`);
    
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate bill ID
    const count = await Billing.countDocuments();
    data.billId = `BIL${String(count + 1).padStart(4, '0')}`;
    
    const bill = await Billing.create(data);
    await bill.populate(['patientId', 'appointmentId']);
    
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating billing record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}