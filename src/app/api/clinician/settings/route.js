import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json(
        { error: 'Forbidden: Clinician access only' },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select(
        'firstName lastName phone email role avatar timezone bio professional clinical availability notifications'
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Structure the response to match the frontend requirements
    const settings = {
      userId: user._id,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        avatarUrl: user.avatar,
        timezone: user.timezone || 'UTC',
        bio: user.bio || '',
        email: user.email, // Read-only but useful to show
        role: user.role, // Read-only
      },
      professional: user.professional || {
        licenseNumber: '',
        licenseBody: '',
        experienceYears: 0,
        specializations: [],
        primaryPracticeArea: '',
        verified: false,
      },
      clinicalPreferences: user.clinical || {
        defaultModules: [],
        painScale: 'VAS',
        autoSuggestTests: true,
      },
      availability: user.availability || {
        timezone: user.timezone || 'UTC',
        sessionBuffer: 15,
        acceptNewPatients: true,
        schedule: {
          monday: { enabled: true, timeSlots: [] },
          tuesday: { enabled: true, timeSlots: [] },
          wednesday: { enabled: true, timeSlots: [] },
          thursday: { enabled: true, timeSlots: [] },
          friday: { enabled: true, timeSlots: [] },
          saturday: { enabled: false, timeSlots: [] },
          sunday: { enabled: false, timeSlots: [] },
        },
      },
      notifications: user.notifications || {
        email: true,
        inApp: true,
        events: [],
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching clinician settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
