'use client';

import React from 'react';
import { Search, ListFilter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const mockPatients = [
  {
    id: 1,
    name: 'Bola Ahmed Tinubu',
    sex: 'Male',
    time: '8:00am',
    date: '12-11-2025',
    status: 'green',
  },
  {
    id: 2,
    name: 'Tomisi Faith John',
    sex: 'Female',
    time: '8:30am',
    date: '12-11-2025',
    status: 'green',
  },
  {
    id: 3,
    name: 'Henry Ahmed Garet',
    sex: 'Male',
    time: '10:00am',
    date: '12-11-2025',
    status: 'yellow',
  },
  {
    id: 4,
    name: 'Bola Saed Dushak',
    sex: 'Male',
    time: '10:30am',
    date: '12-11-2025',
    status: 'red',
  },
];

export default function PatientQueue() {
  return (
    <div className="space-y-8">
      {/* Search and Filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter patient's Full Name"
            className="focus:border-primary focus:ring-primary/20 w-full rounded-2xl border border-gray-100 bg-white px-6 py-4 pr-12 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
          />
          <Search className="absolute top-1/2 right-6 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
        <button className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-all hover:bg-gray-50">
          <ListFilter className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-4">
        {mockPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}

function PatientCard({ patient }) {
  return (
    <div className="group relative flex items-center justify-between rounded-[2rem] border border-gray-50 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:px-10">
      {/* Status Dot */}
      <div
        className={cn(
          'absolute top-6 right-8 h-3 w-3 rounded-full',
          patient.status === 'green' && 'bg-green-500',
          patient.status === 'yellow' && 'bg-yellow-400',
          patient.status === 'red' && 'bg-red-500'
        )}
      />

      <div className="flex items-center gap-6 lg:gap-8">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Image
            src="/avatar-placeholder.png"
            alt="Avatar"
            width={40}
            height={40}
            className="opacity-40"
            onerror={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=' + patient.name;
            }}
          />
        </div>

        {/* Patient Info */}
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-gray-900 lg:text-lg">{patient.name}</h3>
          <span className="text-sm font-medium text-gray-400">{patient.sex}</span>
        </div>
      </div>

      {/* Time and Date */}
      <div className="hidden flex-col items-center sm:flex">
        <span className="text-sm font-bold text-gray-900">{patient.time}</span>
        <span className="text-sm font-medium text-gray-400">{patient.date}</span>
      </div>

      {/* Action Button */}
      <Link
        href={`/clinician/dashboard/case/${patient.id}`}
        className="rounded-lg bg-[#3da9f5] px-8 py-2 text-sm font-bold text-white transition-all hover:bg-[#2c91db] hover:shadow-md"
      >
        View
      </Link>
    </div>
  );
}
