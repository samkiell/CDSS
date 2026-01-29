import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Appointment, Notification } from '@/models';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await connectDB();

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Ensure the clinician owns this appointment
    if (appointment.therapist.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    appointment.status = status;
    await appointment.save();

    // Notify patient
    if (status === 'Cancelled') {
      await Notification.create({
        userId: appointment.patient,
        title: 'Appointment Cancelled',
        description: `Your appointment with Dr. ${appointment.therapistName} on ${new Date(appointment.date).toLocaleDateString()} has been cancelled.`,
        type: 'Appointments',
        link: '/patient/dashboard',
      });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Ensure the clinician owns this appointment
    if (appointment.therapist.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Appointment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    console.error('Appointment deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
