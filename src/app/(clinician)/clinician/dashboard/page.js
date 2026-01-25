import React from 'react';
import PatientQueue from '@/components/dashboard/PatientQueue';

export const metadata = {
  title: 'Clinician Dashboard - CDSS',
};

export default function ClinicianDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Assigned Caseload</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage your active patient assessments.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PatientQueue />
      </main>
    </div>
  );
}
