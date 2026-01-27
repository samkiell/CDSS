import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import DiagnosisSession from '@/models/DiagnosisSession';
import {
  UsersActivityChart,
  TherapistActivityChart,
  WeeklyReportChart,
} from '@/components/admin/DashboardCharts';
import { TriageQueue, TherapistManagement } from '@/components/admin/DashboardComponents';

export default async function AdminDashboardPage() {
  await connectDB();

  // Fetch Activity Stats
  const patientCount = await User.countDocuments({ role: ROLES.PATIENT });
  const activePatientCount = await User.countDocuments({
    role: ROLES.PATIENT,
    isVerified: true,
  });
  const pendingPatientCount = patientCount - activePatientCount;

  const clinicianCount = await User.countDocuments({ role: ROLES.CLINICIAN });
  const activeClinicianCount = await User.countDocuments({
    role: ROLES.CLINICIAN,
    isActive: true,
  });

  // Fetch Triage Queue (New Cases)
  const newCases = await DiagnosisSession.find({ status: 'pending_review' })
    .populate('patientId', 'firstName lastName avatar phone gender')
    .sort({ createdAt: -1 })
    .limit(5);

  // Fetch Therapists for Management
  const approvedTherapists = await User.find({ role: ROLES.CLINICIAN })
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingTherapists = await User.find({ role: ROLES.PATIENT }) // Conceptually candidates
    .sort({ createdAt: -1 })
    .limit(5);

  // Weekly Report Data (Mocking for now as we might not have 7 days of data)
  const weeklyData = [
    { day: 'Mon', users: 12, therapists: 2 },
    { day: 'Tue', users: 19, therapists: 3 },
    { day: 'Wed', users: 15, therapists: 5 },
    { day: 'Thu', users: 22, therapists: 4 },
    { day: 'Fri', users: 30, therapists: 8 },
    { day: 'Sat', users: 25, therapists: 6 },
    { day: 'Sun', users: 40, therapists: 10 },
  ];

  return (
    <div className="space-y-10 pb-12">
      <header>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          System Overview
        </h2>
        <p className="font-medium text-gray-500">
          Real-time health of the CDSS ecosystem
        </p>
      </header>

      {/* Row 1: Activity Monitors */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <UsersActivityChart active={activePatientCount} pending={pendingPatientCount} />
        <TherapistActivityChart active={activeClinicianCount} total={clinicianCount} />
      </div>

      {/* Row 2: New Cases (Triage Queue) */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <span className="flex h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
            New Cases (Triage Queue)
          </h3>
          <button className="text-primary text-sm font-bold hover:underline">
            View All Queue
          </button>
        </div>
        <TriageQueue cases={newCases} />
      </section>

      {/* Row 3: Therapist Management */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Therapist Management
          </h3>
          <button className="text-primary text-sm font-bold hover:underline">
            Manage All
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <TherapistManagement
            title="Newly Approved Therapists"
            therapists={approvedTherapists}
            type="approved"
          />
          <TherapistManagement
            title="Pending Therapist Role Requests"
            therapists={pendingTherapists}
            type="pending"
          />
        </div>
      </section>

      {/* Row 4: Weekly Report */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Growth Analytics
          </h3>
          <p className="text-sm text-gray-400">
            Weekly signup trends for Patients vs Therapists
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <WeeklyReportChart data={weeklyData} />
        </div>
      </section>
    </div>
  );
}
