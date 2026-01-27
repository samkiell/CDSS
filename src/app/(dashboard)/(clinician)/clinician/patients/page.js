import React from 'react';
import { Users as UsersIcon, UserPlus, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import { DiagnosisSession } from '@/models';
import PatientListClient from '@/components/dashboard/clinician/PatientListClient';

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
