'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function TreatmentPlannerClient({ initialPatients = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = useMemo(
    () =>
      initialPatients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [initialPatients, searchQuery]
  );

  const statusConfig = {
    completed: {
      color: 'bg-emerald-500',
      label: 'Case Completed',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    inprogress: {
      color: 'bg-indigo-500',
      label: 'Active Rehab',
      icon: <Activity className="h-3 w-3" />,
    },
    not_started: {
      color: 'bg-slate-400',
      label: 'Pending Plan',
      icon: <Clock className="h-3 w-3" />,
    },
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="group relative">
        <div className="from-primary/20 absolute -inset-1 rounded-2xl bg-gradient-to-r to-indigo-500/20 opacity-25 blur transition duration-1000 group-focus-within:opacity-100"></div>
        <Card className="bg-card relative rounded-2xl border-none shadow-sm">
          <CardContent className="p-0">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground group-focus-within:text-primary absolute left-6 h-5 w-5 transition-colors" />
              <input
                type="text"
                placeholder="Search assigned patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="placeholder:text-muted-foreground/50 h-16 w-full rounded-2xl bg-transparent pr-6 pl-16 font-sans text-sm font-bold transition-all focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => {
          const status = statusConfig[patient.status];

          return (
            <Card
              key={patient.id}
              className="group bg-card relative overflow-hidden rounded-[2.5rem] border-none shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 p-6">
                <Badge
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border-none px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg',
                    status.color
                  )}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>

              <CardContent className="space-y-8 p-8">
                <div className="flex items-center gap-6">
                  <Avatar className="ring-primary/5 group-hover:ring-primary/20 h-20 w-20 rounded-3xl ring-4 transition-all">
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                      {patient.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-foreground truncate text-xl font-black tracking-tighter uppercase italic">
                      {patient.name}
                    </h3>
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      {patient.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-muted-foreground flex items-center justify-between px-1 text-[10px] font-black tracking-widest uppercase opacity-60">
                    <span>Recovery Progress</span>
                    <span className="text-primary">64%</span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div className="bg-primary h-full w-[64%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/clinician/treatment/view/${patient.id}`}
                    className="flex-1"
                  >
                    <Button className="bg-foreground text-background h-12 w-full rounded-xl text-[10px] font-black tracking-widest uppercase transition-all hover:brightness-110 active:scale-95">
                      Open File
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="hover:bg-muted h-12 flex-1 rounded-xl border-2 text-[10px] font-black tracking-widest uppercase transition-all active:scale-95"
                  >
                    {patient.status === 'not_started' ? 'Assign Plan' : 'Modify'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-6 py-20 text-center opacity-40">
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
              <FlaskConical className="h-10 w-10" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter uppercase italic">
                No Treatment Plans
              </p>
              <p className="text-sm font-medium">
                Search for an assigned patient to begin or modify their plan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
