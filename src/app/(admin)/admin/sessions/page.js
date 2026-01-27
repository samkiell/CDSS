import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import User, { ROLES } from '@/models/User';
import { SessionAssignmentList } from '@/components/admin/SessionAssignmentList';

export default async function AdminSessionsPage({ searchParams }) {
  await connectDB();

  const { id } = await searchParams;

  // Fetch all sessions (populated)
  const sessions = await DiagnosisSession.find()
    .populate('patientId', 'firstName lastName avatar email phone gender')
    .populate('clinicianId', 'firstName lastName avatar specialization')
    .sort({ createdAt: -1 });

  // Fetch all clinicians for assignment dropdown
  const clinicians = await User.find({ role: ROLES.CLINICIAN, isActive: true }).select(
    'firstName lastName avatar specialization'
  );

  return (
    <div className="space-y-10 pb-12">
      <header>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          Case Assignments
        </h2>
        <p className="font-medium text-gray-500">
          Link patients to the most suitable clinicians
        </p>
      </header>

      <SessionAssignmentList
        sessions={sessions}
        clinicians={clinicians}
        initialSelectedId={id}
      />
    </div>
  );
}
