import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import AdminTherapistListClient from '@/components/admin/TherapistListClient';

export default async function AdminTherapistsPage() {
  await connectDB();

  // Fetch all clinicians
  const therapistsRaw = await User.find({ role: 'CLINICIAN' })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose objects
  const therapists = JSON.parse(JSON.stringify(therapistsRaw));

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2 px-2">
        <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic dark:text-white">
          Clinician Management
        </h2>
        <p className="font-medium text-gray-500">
          Verify credentials, medical licenses, and manage specialty assignments for
          healthcare providers.
        </p>
      </header>

      <AdminTherapistListClient initialTherapists={therapists} />
    </div>
  );
}
