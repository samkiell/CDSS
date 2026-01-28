import React from 'react';
import { Users as UsersIcon, FileText, Activity, ClipboardList } from 'lucide-react';
import PatientQueue from '@/components/dashboard/PatientQueue';
import ClinicianHero from '@/components/dashboard/clinician/ClinicianHero';
import ClinicianQuickActions from '@/components/dashboard/clinician/ClinicianQuickActions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import { DiagnosisSession, User } from '@/models';

export default async function ClinicianDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'CLINICIAN') {
    redirect('/login');
  }

  await dbConnect();

  const clinicianId = session.user.id;

  // Fetch Stats
  const [totalPatientsCount, pendingReviewCount, urgentCasesCount, assignedSessionsRaw] =
    await Promise.all([
      DiagnosisSession.distinct('patientId', { clinicianId }).then((ids) => ids.length),
      DiagnosisSession.countDocuments({ clinicianId, status: 'assigned' }),
      DiagnosisSession.countDocuments({
        clinicianId,
        status: 'assigned',
        'aiAnalysis.riskLevel': 'Urgent',
      }),
      DiagnosisSession.find({ clinicianId })
        .populate('patientId', 'firstName lastName avatar gender')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

  const sessions = JSON.parse(JSON.stringify(assignedSessionsRaw));

  // Format stats for rendering
  const stats = [
    {
      label: 'Total Patients',
      value: totalPatientsCount.toString(),
      icon: UsersIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-l-primary',
    },
    {
      label: 'Cases to Review',
      value: pendingReviewCount.toString(),
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-l-indigo-500',
    },
    {
      label: 'Urgent Cases',
      value: urgentCasesCount.toString().padStart(2, '0'),
      icon: Activity,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-l-emerald-500',
    },
  ];

  // Latest patient for the hero
  const latestSession = sessions[0];
  const latestPatient = latestSession
    ? {
        id: latestSession._id,
        name: `${latestSession.patientId?.firstName} ${latestSession.patientId?.lastName}`,
        region: latestSession.bodyRegion,
        risk: latestSession.aiAnalysis?.riskLevel,
      }
    : null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Monitor patient progress and manage clinical tasks efficiently.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className={`${stat.borderColor} border-l-4`}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`${stat.bgColor} rounded-xl p-3`}>
                <stat.icon className={`${stat.color} h-6 w-6`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Section: Main Highlights */}
        <div className="space-y-6 md:col-span-8">
          <ClinicianHero latestPatient={latestPatient} />

          {/* Patient Queue / Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ClipboardList className="text-primary h-5 w-5" />
                  Assigned Patient Cases
                </CardTitle>
                <CardDescription>
                  Review and manage the diagnostic sessions assigned to you
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PatientQueue initialSessions={sessions} />
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Actions & Schedule */}
        <div className="space-y-6 md:col-span-4">
          <ClinicianQuickActions />

          {/* Today's Schedule Mini-Card - Real data would come from an Appointment model if implemented, for now keep as is but could fetch actual next sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next in Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.slice(0, 3).length > 0 ? (
                sessions.slice(0, 3).map((sess, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-start gap-4 pb-4 last:pb-0"
                  >
                    {idx !== sessions.slice(0, 3).length - 1 && (
                      <div className="bg-border absolute top-[30px] bottom-0 left-[15px] w-[2px]" />
                    )}
                    <div className="bg-primary/20 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <p className="text-primary text-xs font-bold">
                        {new Date(sess.createdAt).toLocaleDateString()}
                      </p>
                      <p className="max-w-[150px] truncate text-sm font-bold">
                        {sess.patientId?.firstName} {sess.patientId?.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs tracking-tighter uppercase">
                        {sess.bodyRegion} Assessment
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 text-center text-sm italic">
                  No pending items in queue
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
