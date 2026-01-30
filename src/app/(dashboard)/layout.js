import { redirect } from 'next/navigation';
import { auth } from '../../../auth';

export default async function Layout({ children }) {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  // Check Maintenance Mode
  const connectDB = (await import('@/lib/db/connect')).default;
  await connectDB();
  const { AdminSettings } = await import('@/models');
  const settings = await AdminSettings.getSettings();
  if (settings.system.maintenanceMode && session.user.role !== 'ADMIN') {
    // We could redirect to a specific maintenance page, but for now just logout or unauthorized
    redirect('/maintenance');
  }

  return <div className="bg-background min-h-screen">{children}</div>;
}
