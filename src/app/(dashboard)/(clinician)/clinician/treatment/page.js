import connectDB from '@/lib/db/connect';
import { DiagnosisSession, TreatmentPlan } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TreatmentPlannerClient from '@/components/dashboard/clinician/TreatmentPlannerClient';

export default async function TreatmentPlannerPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const clinicianId = session.user.id;

  // Fetch all sessions for this clinician to find their assigned patients
  const sessions = await DiagnosisSession.find({ clinicianId })
    .populate('patientId', 'firstName lastName avatar gender')
    .sort({ updatedAt: -1 })
    .lean();

  // Aggregate into unique patients
  const patientsMap = new Map();

  // Get all active treatment plans to check status
  const activePlans = await TreatmentPlan.find({
    therapistName: { $regex: session.user.lastName, $options: 'i' },
  }).lean();

  sessions.forEach((sess) => {
    if (!sess.patientId) return;
    const pId = sess.patientId._id.toString();

    if (!patientsMap.has(pId)) {
      const plan = activePlans.find((ap) => ap.patient.toString() === pId);

      patientsMap.set(pId, {
        id: pId,
        name: `${sess.patientId.firstName} ${sess.patientId.lastName}`,
        gender: sess.patientId.gender || 'Not specified',
        avatar: sess.patientId.avatar,
        status: plan
          ? plan.status === 'completed'
            ? 'completed'
            : 'inprogress'
          : 'not_started',
        planId: plan?._id.toString(),
      });
    }
  });

  const patientsList = Array.from(patientsMap.values());

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-8 sm:px-4 sm:pb-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          Treatment Planner
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage and track recovery programs for your assigned patients.
        </p>
      </header>

      <TreatmentPlannerClient initialPatients={patientsList} />
    </div>
  );
}
