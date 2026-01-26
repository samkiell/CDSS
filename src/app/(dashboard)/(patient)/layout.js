import { TopNav } from '@/components/layout';
import { patientLinks } from '@/components/layout/navLink';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function PatientLayout({ children }) {
  const session = await auth();
  if (!session || !session.user) redirect('/login');
  if (session?.user?.role !== 'PATIENT' && session?.user.role === 'CLINICIAN') {
    redirect('/clinician/dashboard');
  }
  return (
    <>
      <Sidebar links={patientLinks} user={session?.user} />
      <div className="lg:pl-64">
        <TopNav title="Patient Dashboard" />
        <main className="mt-5 p-4 pt-0 lg:p-6 lg:pt-0">{children}</main>
      </div>
    </>
  );
}
