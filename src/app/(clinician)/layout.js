'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserCog,
  FileBarChart,
  Settings,
} from 'lucide-react';
import { Sidebar, TopNav } from '@/components/layout';

const clinicianLinks = [
  { href: '/clinician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinician/patients', label: 'Patients', icon: Users },
  { href: '/clinician/cases', label: 'Cases', icon: FolderKanban },
  { href: '/clinician/therapists', label: 'Therapists', icon: UserCog },
  { href: '/clinician/reports', label: 'Reports', icon: FileBarChart },
  { href: '/clinician/settings', label: 'Settings', icon: Settings },
];

export default function ClinicianLayout({ children }) {
  return (
    <div className="bg-background min-h-screen">
      <Sidebar links={clinicianLinks} />

      <div className="lg:pl-64">
        <TopNav title="Clinician Portal" />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
