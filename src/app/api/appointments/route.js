import { auth } from '@/../auth';
import connectDB from '@/lib/db/connect';
import { Appointment, User } from '@/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, date, time, type, location } = body;

    if (!patientId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Combine date and time
    const appointmentDate = new Date(`${date}T${time}`);

    const clinicianName =
      session.user.name || `${session.user.firstName} ${session.user.lastName}`;

    const appointment = await Appointment.create({
      patient: patientId,
      therapist: session.user.id,
      therapistName: clinicianName,
      date: appointmentDate,
      type: type || 'General Consultation',
      location: location || 'Virtual Session',
      status: 'Scheduled',
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
