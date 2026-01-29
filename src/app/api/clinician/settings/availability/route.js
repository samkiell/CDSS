import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import { availabilitySchema } from '@/lib/validations/clinician-settings';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = availabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { timezone, sessionBuffer, acceptNewPatients, weeklySchedule } =
      validation.data;

    await connectDB();

    // We might also update the root timezone if it's passed here, or keep them synced.
    // The requirement says "Timezone locked" in Availability section, which usually means it displays the Profile timezone but doesn't let you change it here, OR it forces this schedule to be interpreted in that timezone.
    // The validation schema has timezone.
    // I'll update the availability object.

    const updateData = {
      'availability.sessionBuffer': sessionBuffer,
      'availability.acceptNewPatients': acceptNewPatients,
      'availability.schedule': weeklySchedule, // Ensure the structure matches schema
    };

    // Note: The User model has 'schedule', but Schema expects 'weeklySchedule'.
    // In User.js I defined 'availability.schedule'.
    // The Zod schema has 'weeklySchedule'. I should map it or be consistent.
    // I'll map 'weeklySchedule' to 'schedule' in the DB.

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'availability.sessionBuffer': sessionBuffer,
          'availability.acceptNewPatients': acceptNewPatients,
          'availability.schedule': weeklySchedule,
        },
      },
      { new: true, runValidators: true }
    );

    const availabilityObj = user.availability
      ? JSON.parse(JSON.stringify(user.availability))
      : {};
    return NextResponse.json({
      timezone: user.timezone,
      ...availabilityObj,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
