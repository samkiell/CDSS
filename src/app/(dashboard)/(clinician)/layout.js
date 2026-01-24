import { Sidebar, TopNav } from '@/components/layout';
import { clinicianLinks } from '@/components/layout/navLink';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';

export default async function ClinicianLayout({ children }) {
  const session = await auth();
  console.log(session);
  if (!session || !session.user) redirect('/login');
  if (session?.user?.role !== 'CLINICIAN' && session?.user.role === 'PATIENT') {
    redirect('/patient/dashboard');
  }
  return (
    <>
      <Sidebar links={clinicianLinks} />
      <div className="lg:pl-64">
        <TopNav title="Therapist's Dashboard" />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </>
  );
}
