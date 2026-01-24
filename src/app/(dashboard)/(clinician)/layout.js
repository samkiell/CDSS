import { Sidebar, TopNav } from '@/components/layout';
import { clinicianLinks } from '@/components/layout/navLink';

export default function ClinicianLayout({ children }) {
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
