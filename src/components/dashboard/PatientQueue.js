'use client';

import React, { useState } from 'react';
import { Search, ListFilter, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Card, Button, Input } from '@/components/ui';

const mockPatients = [
  {
    id: '1',
    name: 'Bola Ahmed Tinubu',
    sex: 'Male',
    time: '8:00am',
    date: '12-11-2025',
    status: 'success',
  },
  {
    id: '2',
    name: 'Tomisi Faith John',
    sex: 'Female',
    time: '8:30am',
    date: '12-11-2025',
    status: 'success',
  },
  {
    id: '3',
    name: 'Henry Ahmed Garet',
    sex: 'Male',
    time: '10:00am',
    date: '12-11-2025',
    status: 'warning',
  },
  {
    id: '4',
    name: 'Bola Saed Dushak',
    sex: 'Male',
    time: '10:30am',
    date: '12-11-2025',
    status: 'destructive',
  },
];

export default function PatientQueue() {
  const [search, setSearch] = useState('');

  if (mockPatients.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="relative mb-8 h-48 w-48 opacity-20">
          <svg
            viewBox="0 0 120 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground"
          >
            <rect
              x="10"
              y="10"
              width="100"
              height="130"
              rx="5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M30 40H90M30 60H90M30 80H70"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="85"
              cy="85"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M78 85H92M85 78V92"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1="5" y1="145" x2="115" y2="5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p className="text-muted-foreground max-w-xs text-center text-lg font-semibold">
          No Patient Case File Has Been Assigned To You
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden pb-12">
      {/* Search and Filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Enter patient's Full Name"
            className="bg-card border-border focus:ring-primary/10 h-14 w-full rounded-2xl px-6 text-sm shadow-sm transition-all focus:ring-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-card border-border hover:bg-accent text-foreground flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-all">
          <ListFilter className="h-6 w-6" />
        </button>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-4">
        {mockPatients
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
      </div>
    </div>
  );
}

function PatientCard({ patient }) {
  return (
    <Card className="group border-border bg-card relative flex items-center justify-between rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md lg:px-10">
      {/* Status Dot */}
      <div
        className={cn(
          'absolute top-6 right-8 h-3 w-3 rounded-full shadow-sm',
          patient.status === 'success' && 'bg-success',
          patient.status === 'warning' && 'bg-warning',
          patient.status === 'destructive' && 'bg-destructive'
        )}
      />

      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="bg-muted border-border flex h-16 w-16 shrink-0 items-center justify-center rounded-full border shadow-inner">
          <User className="text-muted-foreground/50 h-8 w-8" />
        </div>

        {/* Patient Info */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-foreground text-lg leading-none font-bold">
            {patient.name}
          </h3>
          <span className="text-muted-foreground text-sm font-medium capitalize">
            {patient.sex}
          </span>
        </div>
      </div>

      {/* Time and Date */}
      <div className="hidden flex-col items-center sm:flex">
        <span className="text-foreground text-sm font-bold">{patient.time}</span>
        <span className="text-muted-foreground text-sm font-medium">{patient.date}</span>
      </div>

      {/* Action Button */}
      <Link href={`/clinician/dashboard/case/${patient.id}`}>
        <Button className="rounded-lg border-none bg-[#3da9f5] px-10 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2c91db]">
          View
        </Button>
      </Link>
    </Card>
  );
}
