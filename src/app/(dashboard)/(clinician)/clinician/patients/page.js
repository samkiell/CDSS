import React from 'react';
import {
  Users as UsersIcon,
  Search,
  ListFilter,
  UserPlus,
  MoreHorizontal,
  Activity,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import { DiagnosisSession, User } from '@/models';

export default async function PatientsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'CLINICIAN') {
    redirect('/login');
  }

  await dbConnect();
  const clinicianId = session.user.id;

  // Fetch unique patients assigned to this clinician through sessions
  const sessions = await DiagnosisSession.find({ clinicianId })
    .populate('patientId', 'firstName lastName avatar gender dateOfBirth')
    .sort({ updatedAt: -1 })
    .lean();

  // Aggregate into unique patients with their latest session info
  const patientsMap = new Map();
  sessions.forEach((sess) => {
    if (!sess.patientId) return;
    const pId = sess.patientId._id.toString();
    if (!patientsMap.has(pId)) {
      patientsMap.set(pId, {
        id: pId,
        name: `${sess.patientId.firstName} ${sess.patientId.lastName}`,
        sex: sess.patientId.gender || 'N/A',
        avatar: sess.patientId.avatar,
        age: sess.patientId.dateOfBirth
          ? Math.floor(
              (new Date() - new Date(sess.patientId.dateOfBirth)) /
                (1000 * 60 * 60 * 24 * 365.25)
            )
          : 'N/A',
        lastSession: sess.updatedAt || sess.createdAt,
        condition: sess.bodyRegion,
        status:
          sess.aiAnalysis?.riskLevel === 'Urgent'
            ? 'urgent'
            : sess.aiAnalysis?.riskLevel === 'Moderate'
              ? 'warning'
              : 'success',
        riskLevel: sess.aiAnalysis?.riskLevel || 'Low',
        sessionId: sess._id.toString(),
      });
    }
  });

  const patientsList = Array.from(patientsMap.values());

  const stats = [
    {
      label: 'Active Patients',
      value: patientsList.length.toString(),
      icon: UsersIcon,
      color: 'text-primary',
    },
    {
      label: 'New This Week',
      value: patientsList
        .filter(
          (p) => new Date(p.lastSession) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
        .length.toString(),
      icon: UserPlus,
      color: 'text-indigo-500',
    },
    {
      label: 'Urgent Cases',
      value: patientsList.filter((p) => p.riskLevel === 'Urgent').length.toString(),
      icon: Activity,
      color: 'text-destructive',
    },
  ];

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
      </div>

      <PatientListClient patients={JSON.parse(JSON.stringify(patientsList))} />
    </div>
  );
}

// Separate client component for search/filter logic
function PatientListClient({ patients }) {
  const [search, setSearch] = React.useState('');

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
            <UsersIcon className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
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
