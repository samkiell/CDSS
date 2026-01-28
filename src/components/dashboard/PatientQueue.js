'use client';

import React, { useState } from 'react';
import { Search, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Card, Button, Input } from '@/components/ui';

export default function PatientQueue({ initialSessions = [] }) {
  const [search, setSearch] = useState('');
  const [sessions] = useState(initialSessions);

  const filteredSessions = sessions.filter((s) => {
    const name = `${s.patientId?.firstName} ${s.patientId?.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (sessions.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="relative mb-8 h-48 w-48 text-gray-400 opacity-20">
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
            placeholder="Search cases..."
            className="bg-card border-border focus:ring-primary/10 h-12 w-full rounded-2xl pr-12 pl-6 text-sm shadow-sm transition-all focus:ring-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-card border-border hover:bg-accent text-foreground flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all">
          <ListFilter className="h-5 w-5" />
        </button>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <PatientCard key={session._id} session={session} />
        ))}
        {filteredSessions.length === 0 && sessions.length > 0 && (
          <div className="text-muted-foreground py-10 text-center">
            No patient records match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function PatientCard({ session }) {
  const patient = session.patientId;
  const status = session.aiAnalysis?.riskLevel;

  return (
    <Card className="group border-border bg-card relative flex flex-col gap-4 rounded-[2rem] p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between lg:px-10">
      {/* Risk Badge */}
      <div
        className={cn(
          'absolute top-6 right-6 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase sm:right-8',
          status === 'Urgent'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : status === 'Moderate'
              ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        )}
      >
        {status || 'Low'} Risk
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="bg-primary/10 text-primary border-primary/20 relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xl font-bold shadow-inner sm:h-16 sm:w-16">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            patient?.firstName?.[0] || 'P'
          )}
        </div>

        {/* Patient Info */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-foreground text-base leading-none font-bold sm:text-lg">
            {patient?.firstName} {patient?.lastName}
          </h3>
          <span className="text-muted-foreground text-xs font-medium capitalize sm:text-sm">
            {patient?.gender || 'N/A'} • {session.bodyRegion} Assessment
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="hidden flex-col items-center sm:flex">
        <span className="text-foreground text-sm font-bold tracking-widest uppercase">
          Assigned
        </span>
        <span className="text-muted-foreground text-sm font-medium">
          {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Action Button */}
      <Link
        href={`/clinician/dashboard/case/${session._id}`}
        className="w-full sm:w-auto"
      >
        <Button className="bg-primary w-full rounded-xl border-none px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 sm:w-auto sm:px-10">
          View Case
        </Button>
      </Link>
    </Card>
  );
}
