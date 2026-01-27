import connectDB from '@/lib/db/connect';
import { DiagnosisSession } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReferralClient from '@/components/dashboard/clinician/ReferralClient';

export default async function ReferralPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const clinicianId = session.user.id;

  // Fetch all unique patients for this clinician
  const sessions = await DiagnosisSession.find({ clinicianId })
    .populate('patientId', 'firstName lastName avatar gender updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  const patientsMap = new Map();
  sessions.forEach((sess) => {
    if (!sess.patientId) return;
    const pId = sess.patientId._id.toString();
    if (!patientsMap.has(pId)) {
      patientsMap.set(pId, {
        id: pId,
        name: `${sess.patientId.firstName} ${sess.patientId.lastName}`,
        gender: sess.patientId.gender || 'Not specified',
        avatar: sess.patientId.avatar,
        lastActive: sess.updatedAt,
        status: sess.aiAnalysis?.riskLevel === 'Urgent' ? 'urgent' : 'active',
      });
    }
  });

  const patients = Array.from(patientsMap.values());

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-8 sm:px-4 sm:pb-10">
      <header className="mb-8 flex flex-col gap-2">
        <h2 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          Referral Management
        </h2>
        <p className="text-muted-foreground font-medium">
          Issue clinical referrals and orders for your patients to external healthcare
          centers.
        </p>
      </header>

      <ReferralClient initialPatients={patients} />
    </div>
  );
}
