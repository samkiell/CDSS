'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  ListFilter,
  UserPlus,
  MoreHorizontal,
  ChevronRight,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';

const mockPatients = [
  {
    id: '1',
    name: 'Bola Ahmed Tinubu',
    sex: 'Male',
    age: '72',
    lastSession: '2026-01-25',
    condition: 'Chronic Lower Back Pain',
    status: 'urgent',
    riskLevel: 'High',
  },
  {
    id: '2',
    name: 'Tomisi Faith John',
    sex: 'Female',
    age: '34',
    lastSession: '2026-01-27',
    condition: 'Lumbar Strain',
    status: 'success',
    riskLevel: 'Low',
  },
  {
    id: '3',
    name: 'Henry Ahmed Garet',
    sex: 'Male',
    age: '45',
    lastSession: '2026-01-24',
    condition: 'Sciatica',
    status: 'warning',
    riskLevel: 'Moderate',
  },
  {
    id: '4',
    name: 'Bola Saed Dushak',
    sex: 'Male',
    age: '29',
    lastSession: '2026-01-23',
    condition: 'Post-Op Recovery',
    status: 'success',
    riskLevel: 'Low',
  },
  {
    id: '5',
    name: 'Sarah Adebayo',
    sex: 'Female',
    age: '56',
    lastSession: '2026-01-26',
    condition: 'Herniated Disc',
    status: 'urgent',
    riskLevel: 'High',
  },
];

export default function PatientsPage() {
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Active Patients', value: '48', icon: Users, color: 'text-primary' },
    { label: 'New This Week', value: '+12', icon: UserPlus, color: 'text-indigo-500' },
    {
      label: 'Average Recovery',
      value: '84%',
      icon: Activity,
      color: 'text-emerald-500',
    },
  ];

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header & Stats Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-muted/30 border-none shadow-none">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={cn(
                    'dark:bg-card border-border rounded-xl border bg-white p-2 shadow-sm',
                    stat.color
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    {stat.label}
                  </p>
                  <h3 className="text-xl font-black">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 gap-2 rounded-xl px-6 font-bold">
            <UserPlus className="h-4 w-4" />
            Add New Patient
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Advanced Filter */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:max-w-md">
            <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, condition or ID..."
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
            <div className="bg-muted/50 border-border flex items-center gap-1 rounded-2xl border p-1.5">
              <button className="dark:bg-card rounded-xl bg-white px-4 py-2 text-xs font-bold shadow-sm">
                All
              </button>
              <button className="text-muted-foreground hover:text-foreground px-4 py-2 text-xs font-bold">
                Active
              </button>
              <button className="text-muted-foreground hover:text-foreground px-4 py-2 text-xs font-bold">
                Archived
              </button>
            </div>
          </div>
        </div>

        {/* Patient Grid/List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <PatientListItem key={patient.id} patient={patient} />
            ))
          ) : (
            <div className="bg-muted/20 border-border flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed py-20">
              <Users className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
              <p className="text-muted-foreground text-lg font-bold">No patients found</p>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
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
    High: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Card className="group border-border bg-card relative overflow-hidden rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md lg:px-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          {/* Avatar with Status Activity Dot */}
          <div className="relative">
            <div className="bg-primary/10 text-primary border-primary/20 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-xl font-extrabold shadow-inner">
              {patient.name?.[0]}
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
              <span className="flex items-center gap-1.5">
                {patient.sex}, {patient.age} yrs
              </span>
              <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
              <span className="flex items-center gap-1.5">ID: #P-{patient.id}092</span>
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
              <span className="text-sm font-black">{patient.condition}</span>
            </div>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Last Visit
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-emerald-500" />
              <span className="text-sm font-black">
                {new Date(patient.lastSession).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/clinician/dashboard/case/${patient.id}`}
            className="flex-1 md:flex-none"
          >
            <Button className="bg-primary w-full gap-2 rounded-xl px-8 py-2 text-sm font-black text-white transition-all hover:shadow-lg">
              View Profile
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
