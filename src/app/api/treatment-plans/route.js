import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { TreatmentPlan, Notification, User } from '@/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, conditionName, activity } = await req.json();

    if (!patientId || !conditionName || !activity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const clinicianName =
      session.user.name || `${session.user.firstName} ${session.user.lastName}`;

    // Find existing active plan for this patient
    let plan = await TreatmentPlan.findOne({
      patient: patientId,
      status: 'active',
    });

    if (plan) {
      // Add new activity to existing plan
      plan.activities.push({
        date:
          activity.date && activity.time
            ? new Date(`${activity.date}T${activity.time}`)
            : new Date(),
        goal: activity.goal,
        activeTreatment: activity.activeTreatment,
        homeExercise: activity.homeExercise,
      });
      // Update progress if needed, for simplicity we increment it
      plan.progress = Math.min(100, (plan.progress || 0) + 5);
      await plan.save();
    } else {
      // Create new plan
      plan = await TreatmentPlan.create({
        patient: patientId,
        therapistName: clinicianName,
        conditionName: conditionName,
        activities: [
          {
            date:
              activity.date && activity.time
                ? new Date(`${activity.date}T${activity.time}`)
                : new Date(),
            goal: activity.goal,
            activeTreatment: activity.activeTreatment,
            homeExercise: activity.homeExercise,
          },
        ],
        progress: 5,
        status: 'active',
      });
    }

    // Create notification for the patient
    await Notification.create({
      userId: patientId,
      title: 'Treatment Plan Updated',
      description: `Dr. ${clinicianName} has updated your treatment plan: "${activity.goal}".`,
      type: 'Treatments',
      link: '/patient/dashboard',
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Treatment plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
