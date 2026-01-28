'use client';

import React, { useState } from 'react';
import {
  Search,
  ListFilter,
  MoreHorizontal,
  Activity,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';

export default function PatientListClient({ patients }) {
  const [search, setSearch] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full md:max-w-md">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, condition..."
            className="bg-card border-border focus:ring-primary/10 h-14 w-full rounded-2xl px-6 text-sm shadow-sm transition-all focus:ring-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Button
            variant="outline"
            className="border-border h-14 flex-1 gap-2 rounded-2xl font-bold md:w-14 md:flex-none"
          >
            <ListFilter className="h-5 w-5" />
            <span className="md:hidden">Filter</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientListItem key={patient.id} patient={patient} />
          ))
        ) : (
          <div className="bg-muted/20 border-border flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed py-20">
            <Activity className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
            <p className="text-muted-foreground text-lg font-bold">No patients found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PatientListItem({ patient }) {
  const statusColors = {
    success: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    urgent: 'bg-destructive',
  };

  const riskColors = {
    Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Moderate:
      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    Urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    High: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Card className="group border-border bg-card relative overflow-hidden rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md lg:px-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="bg-primary/10 text-primary border-primary/20 relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xl font-extrabold shadow-inner">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                patient.name?.[0]
              )}
            </div>
            <div
              className={cn(
                'border-card absolute right-0 bottom-0 h-4 w-4 rounded-full border-4',
                statusColors[patient.status]
              )}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-foreground group-hover:text-primary text-lg leading-none font-black tracking-tight transition-colors">
                {patient.name}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  'px-2 py-0 text-[10px] font-black uppercase',
                  riskColors[patient.riskLevel]
                )}
              >
                {patient.riskLevel} Risk
              </Badge>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 uppercase">
                {patient.sex}, {patient.age} yrs
              </span>
              <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
              <span className="flex items-center gap-1.5 uppercase">
                ID: #P-{patient.id.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap gap-8 md:justify-center">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Condition
            </p>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-indigo-500" />
              <span className="text-sm font-black uppercase">{patient.condition}</span>
            </div>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Last Update
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-emerald-500" />
              <span className="text-sm font-black">
                {new Date(patient.lastSession).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/clinician/dashboard/case/${patient.sessionId}`}
            className="flex-1 md:flex-none"
          >
            <Button className="bg-primary w-full gap-2 rounded-xl px-8 py-2 text-sm font-black text-white transition-all hover:shadow-lg">
              View Case
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="border-border rounded-xl border">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
