'use client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ReferralPage() {
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

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      pending: 'bg-yellow-400',
      urgent: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-8 sm:px-4 sm:pb-10">
      {/* Header text */}
      <h2 className="mb-4 text-sm font-medium text-gray-800 sm:mb-6 sm:text-base dark:text-gray-200">
        Refer your patients to an healthcare center, if necessary
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter patient's Full Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-12 text-sm text-gray-800 placeholder-gray-400 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex flex-1 items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-14 sm:w-14 dark:bg-gray-700">
                <svg
                  className="h-8 w-8 text-gray-400 sm:h-9 sm:w-9 dark:text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
                  {patient.name}
                </h3>
                <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                  {patient.gender}
                </p>
              </div>
            </div>

            <div className="hidden flex-col items-end gap-0.5 sm:flex">
              <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                {patient.time}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {patient.date}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href={`/clinician/referral/${patient.id}`}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:px-6 sm:text-sm"
              >
                Create
              </Link>
              <div
                className={`h-3 w-3 shrink-0 rounded-full ${getStatusColor(patient.status)}`}
              />
            </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img
              src="/doctor-files-medical-svgrepo-com.svg"
              alt="No patients"
              className="mb-4 h-28 w-28 opacity-60 dark:opacity-40 dark:invert"
            />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No patients available for referral
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
