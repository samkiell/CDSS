import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import { clinicalPreferencesSchema } from '@/lib/validations/clinician-settings';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = clinicalPreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { defaultModules, painScale, autoSuggestTests } = validation.data;

    await connectDB();

    const updateData = {
      'clinical.defaultModules': defaultModules,
      'clinical.painScale': painScale,
      'clinical.autoSuggestTests': autoSuggestTests,
    };

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(JSON.parse(JSON.stringify(user.clinical)));
  } catch (error) {
    console.error('Error updating clinical preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
