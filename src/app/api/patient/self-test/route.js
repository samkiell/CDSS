import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import { SelfTest } from '@/models';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const tests = await SelfTest.find({ patientId: session.user.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching self-tests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  /**
   * SELF-GUIDED TEST - FEATURE DEPRECATED
   * =====================================
   * This endpoint is no longer accepting new self-test submissions.
   * 
   * The "New Assessment" flow is now the ONLY way patients can submit
   * clinical assessments.
   * 
   * Historical self-test data remains accessible via GET.
   * Database records are preserved as per requirements.
   */
  return NextResponse.json(
    { 
      error: 'Self-Guided Test feature has been deprecated',
      message: 'Please use the New Assessment flow at /patient/assessment?new=true'
    }, 
    { status: 410 } // 410 Gone - resource no longer available
  );
}