'use client';

import {
  LayoutDashboard,
  ClipboardList,
  TestTube,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { Sidebar, TopNav } from '@/components/layout';

const patientLinks = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/assessment', label: 'Assessment', icon: ClipboardList },
  { href: '/patient/self-test', label: 'Self Test', icon: TestTube },
  { href: '/patient/progress', label: 'Progress', icon: TrendingUp },
  { href: '/patient/settings', label: 'Settings', icon: Settings },
];

export default function PatientLayout({ children }) {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar links={patientLinks} />

      <div className="lg:pl-64">
        <TopNav title="Patient Portal" />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
