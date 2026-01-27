'use client';
import { useState } from 'react';
import SearchPaitent from '@/components/dashboard/clinician/search';
import PatientInfoContainer from '@/components/dashboard/clinician/paitentContainer';

export default function DiagnosticModePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const patients = [
    {
      id: 1,
      name: 'Bola Ahmed Tinubu',
      gender: 'Male',
      time: '8:00am',
      date: '12-11-2025',
      status: 'active',
    },
    {
      id: 2,
      name: 'Tomisi Faith John',
      gender: 'Female',
      time: '8:30am',
      date: '12-11-2025',
      status: 'active',
    },
    {
      id: 3,
      name: 'Henry Ahmed Garet',
      gender: 'Male',
      time: '10:00am',
      date: '12-11-2025',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Bola Saed Dushak',
      gender: 'Male',
      time: '10:30am',
      date: '12-11-2025',
      status: 'urgent',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <SearchPaitent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="space-y-4">
        <PatientInfoContainer
          patients={patients}
          searchQuery={searchQuery}
          url={'/clinician/diagnostic'}
        />
      </div>
    </div>
  );
}
