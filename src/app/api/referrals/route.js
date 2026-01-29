import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, specialty, reason } = await req.json();

    if (!patientId || !specialty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const clinicianName =
      session.user.name || `${session.user.firstName} ${session.user.lastName}`;

    // Create notification for the patient
    await Notification.create({
      userId: patientId,
      title: 'New Referral Authorized',
      description: `Dr. ${clinicianName} has authorized a referral to a ${specialty}. Reason: ${reason || 'Clinical follow-up'}.`,
      type: 'Assessments',
      link: '/patient/dashboard',
    });

    // In a real system, we might also create a Referral record or send an email to the specialist

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
