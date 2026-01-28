import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import AdminUserListClient from '@/components/admin/UserListClient';

export default async function AdminUsersPage() {
  await connectDB();

  // Fetch all users except admins (to focus on platform members)
  const usersRaw = await User.find({ role: { $ne: 'ADMIN' } })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose objects
  const users = JSON.parse(JSON.stringify(usersRaw));

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic dark:text-white">
          User Management
        </h2>
        <p className="font-medium text-gray-500">
          Monitor and manage all registered patients and clinicians on the CDSS platform.
        </p>
      </header>

      <AdminUserListClient initialUsers={users} />
    </div>
  );
}
