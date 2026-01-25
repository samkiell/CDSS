'use client';

import React from 'react';
import { LayoutDashboard, FileText, ClipboardList } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import { useUIStore } from '@/store';
import { cn } from '@/lib/cn';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const { isSidebarOpen } = useUIStore();
  const { data: session } = useSession();

  const clinicianLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '#', // Placeholder
      label: 'My Cases',
      icon: ClipboardList,
    },
    {
      href: '#', // Placeholder
      label: 'Reports',
      icon: FileText,
    },
  ];

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      {/* App Sidebar (Navigation) */}
      <Sidebar
        links={clinicianLinks}
        user={
          session?.user || { firstName: 'Dr.', lastName: 'Clinician', role: 'CLINICIAN' }
        }
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex h-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20' // Adjust based on Sidebar collapsed state width
        )}
      >
        <TopNav title="Clinician Overview" showSidebarTrigger={true} />

        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
