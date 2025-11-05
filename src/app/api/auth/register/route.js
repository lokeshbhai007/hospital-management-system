// src/app/api/auth/register/route.js

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password, role, ...additionalData } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate user ID based on role
    const count = await User.countDocuments({ role });
    let userId;
    switch (role) {
      case 'patient':
        userId = `PAT${String(count + 1).padStart(4, '0')}`;
        break;
      case 'doctor':
        userId = `DOC${String(count + 1).padStart(4, '0')}`;
        break;
      case 'admin':
        userId = `ADM${String(count + 1).padStart(4, '0')}`;
        break;
    }

    // Create user
    const user = await User.create({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      ...additionalData
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}