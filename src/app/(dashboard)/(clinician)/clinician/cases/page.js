import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import { DiagnosisSession } from '@/models';
import CaseListClient from '@/components/dashboard/clinician/CaseListClient';

export default async function CasesPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'CLINICIAN') {
    redirect('/login');
  }

  await dbConnect();

  const clinicianId = session.user.id;

  const assignedSessionsRaw = await DiagnosisSession.find({ clinicianId })
    .populate('patientId', 'firstName lastName avatar gender')
    .sort({ createdAt: -1 })
    .lean();

  const sessions = JSON.parse(JSON.stringify(assignedSessionsRaw));

  // Transform data to match the expected format in PatientInfoContainer
  const patients = sessions.map((sess) => ({
    id: sess._id,
    name: sess.patientId
      ? `${sess.patientId.firstName} ${sess.patientId.lastName}`
      : 'Unknown Patient',
    gender: sess.patientId?.gender || 'Not Specified',
    time: sess.createdAt
      ? new Date(sess.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A',
    date: sess.createdAt ? new Date(sess.createdAt).toLocaleDateString() : 'N/A',
    status:
      sess.aiAnalysis?.riskLevel?.toLowerCase() === 'urgent'
        ? 'urgent'
        : sess.status === 'assigned'
          ? 'pending'
          : 'active',
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Case View</h1>
        <p className="text-muted-foreground font-medium">
          Manage and review diagnostic sessions assigned to you.
        </p>
      </div>
      <CaseListClient initialPatients={patients} />
    </div>
  );
}
