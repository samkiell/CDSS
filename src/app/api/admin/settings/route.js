import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { AdminSettings } from '@/models';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const settings = await AdminSettings.getSettings();

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
