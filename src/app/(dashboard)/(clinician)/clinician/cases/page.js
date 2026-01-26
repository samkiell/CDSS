'use client';
import { useState } from 'react';
import Link from 'next/link';
import SearchPaitent from '@/components/dashboard/clinician/search';
import PaitentInfoCard from '@/components/dashboard/clinician/paitentCard';

export default function Page() {
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

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      pending: 'bg-yellow-400',
      urgent: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="mx-auto max-w-4xl">
      <SearchPaitent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="space-y-4">
        {patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <img
              src="/doctor-files-medical-svgrepo-com.svg"
              alt="No patient cases"
              className="mb-6 h-32 w-32 text-gray-300 sm:h-40 sm:w-40 dark:text-gray-600"
            />
            <p className="text-center text-sm font-medium text-gray-600 sm:text-base dark:text-gray-400">
              No Patient Case File Has Been Assigned To You
            </p>
          </div>
        )}
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient, idx) => {
            return <PaitentInfoCard patient={patient} key={idx} />;
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <img
              src="/doctor-files-medical-svgrepo-com.svg"
              alt="No patient cases"
              className="mb-6 h-32 w-32 text-gray-300 sm:h-40 sm:w-40 dark:text-gray-600"
            />
            <p className="text-center text-sm font-medium text-gray-600 sm:text-base dark:text-gray-400">
              You don&apos;t have an Patient with this Name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
