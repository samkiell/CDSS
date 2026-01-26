'use client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function TreatmentPlannerPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const patients = [
    {
      id: 1,
      name: 'Bola Ahmed Tinubu',
      gender: 'Male',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Tomisi Faith John',
      gender: 'Female',
      status: 'inprogress',
    },
    {
      id: 3,
      name: 'Bola Saed Dushak',
      gender: 'Male',
      status: 'completed',
    },
  ];

  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [patients, searchQuery]
  );

  const statusConfig = {
    completed: { color: 'bg-green-500', label: 'Case Completed' },
    inprogress: { color: 'bg-yellow-400', label: 'Case Inprogress' },
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-8 sm:px-4 sm:pb-10">
      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter patient’s Full Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-12 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => {
          const status = statusConfig[patient.status] || {
            color: 'bg-gray-400',
            label: 'Unknown',
          };

          return (
            <div
              key={patient.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <svg
                    className="h-7 w-7 text-gray-500 dark:text-gray-400"
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

              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className={`h-3 w-3 rounded-full ${status.color}`} />
                <span className="text-xs sm:text-sm">{status.label}</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link
                  href={`/clinician/treatment/view/${patient.id}`}
                  className="flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-cyan-600 sm:text-sm"
                >
                  View
                </Link>
                <button className="flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-cyan-600 sm:text-sm">
                  Create
                </button>
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <img
              src="/doctor-files-medical-svgrepo-com.svg"
              alt="No Treatment Plan"
              className="mb-4 h-32 w-32 opacity-80 sm:h-36 sm:w-36 dark:opacity-60 dark:invert"
            />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No Treatment Plan yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
