// src/app/api/users/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    console.log('Fetching users with role:', role);
    
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query).select('-password');
    console.log(`Found ${users.length} users`);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}