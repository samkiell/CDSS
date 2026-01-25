import PatientQueue from '@/components/dashboard/PatientQueue';

export const metadata = {
  title: 'Clinician Dashboard - CDSS',
};

export default function ClinicianDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl py-4 lg:py-8">
      <PatientQueue />
    </div>
  );
}
