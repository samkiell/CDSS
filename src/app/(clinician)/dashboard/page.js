'use client';

import React from 'react';
import ClinicianDashboard from '@/components/dashboard/ClinicianDashboard';

// Mock Data simulating filtered database results with AI Analysis
const MOCK_PATIENTS = [
  {
    _id: 'p1',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    chiefComplaint: 'Severe lower back pain radiating to both legs',
    aiAnalysis: {
      temporalDiagnosis: 'Suspected Cauda Equina Syndrome',
      confidenceScore: 92,
      riskLevel: 'Urgent',
      reasoning: [
        'Bilateral leg radiation detected',
        'Reports of bladder dysfunction (Red Flag: cauda_equina_bowel_bladder)',
      ],
    },
  },
  {
    _id: 'p2',
    firstName: 'Sarah',
    lastName: 'Smith',
    fullName: 'Sarah Smith',
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    chiefComplaint: 'Sharp pain in heel after playing tennis',
    aiAnalysis: {
      temporalDiagnosis: 'Achilles Tendon Rupture',
      confidenceScore: 78,
      riskLevel: 'Urgent', // Or Moderate depending on rule, but Pop is Urgent
      reasoning: [
        'Sudden onset during activity',
        'Audible pop reported (Red Flag: achilles_rupture_pop)',
      ],
    },
  },
  {
    _id: 'p3',
    firstName: 'Robert',
    lastName: 'Johnson',
    fullName: 'Robert Johnson',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    chiefComplaint: 'Chronic knee pain, stiffer in mornings',
    aiAnalysis: {
      temporalDiagnosis: 'Knee Osteoarthritis',
      confidenceScore: 85,
      riskLevel: 'Low',
      reasoning: ['Age > 50', 'Morning stiffness < 30 mins', 'Crepitus present'],
    },
  },
  {
    _id: 'p4',
    firstName: 'Emily',
    lastName: 'Davis',
    fullName: 'Emily Davis',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    chiefComplaint: 'Shoulder pain when lifting arm',
    aiAnalysis: {
      temporalDiagnosis: 'Rotator Cuff Impingement',
      confidenceScore: 45, // Low confidence
      riskLevel: 'Moderate',
      reasoning: ['Pain with overhead activity', 'Weakness in abduction'],
    },
  },
];

export default function DashboardPage() {
  return (
    <div className="bg-background min-h-screen">
      <ClinicianDashboard patients={MOCK_PATIENTS} />
    </div>
  );
}
