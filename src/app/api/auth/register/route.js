/**
 * User Registration API Route
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role = ROLES.PATIENT } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // TODO: Hash password with bcrypt before saving
    // const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await User.create({
      email,
      password, // Should be hashedPassword in production
      firstName,
      lastName,
      role,
    });

    // Return created user without password
    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: userData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
