// src/app/api/revenue/range/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Billing from '@/models/Billing';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    const revenue = await Billing.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(start),
            $lte: new Date(end)
          },
          status: "paid"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalBills: { $sum: 1 }
        }
      }
    ]);
    
    return NextResponse.json(revenue[0] || { totalRevenue: 0, totalBills: 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}