'use client';

import React from 'react';
import PatientQueue from '@/components/dashboard/PatientQueue';

export default function ClinicianDashboardPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-5xl py-6 lg:py-10">
      <PatientQueue />
    </div>
  );
}
