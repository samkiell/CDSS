'use client';

import Link from 'next/link';
import {
  PlusCircle,
  Clock,
  Clipboard,
  Video,
  Upload,
  Users,
  MessageSquare,
  FileText,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

export default function ClinicianQuickActions() {
  const actions = [
    {
      href: '/clinician/patients',
      label: 'Patient Records',
      icon: Users,
      bg: 'bg-orange-500',
    },
    {
      href: '/clinician/messages',
      label: 'Messages',
      icon: MessageSquare,
      bg: 'bg-yellow-500',
    },
    {
      href: '/clinician/reports',
      label: 'Clinical Files',
      icon: FileText,
      bg: 'bg-emerald-500',
    },
    {
      href: '/clinician/appointments',
      label: 'Schedules',
      icon: Clock,
      bg: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <Link key={i} href={action.href} className="group animate-scale-up">
            <Card className="hover:border-primary/50 h-full transition-all hover:shadow-md">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <div
                  className={`${action.bg} mb-3 rounded-xl p-3 text-white transition-transform group-hover:scale-110`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs leading-tight font-bold">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Link href="/clinician/search" className="group block">
        <Card className="hover:border-primary hover:bg-primary/5 border-dashed transition-all">
          <CardContent className="flex items-center justify-center gap-2 p-4">
            <Search className="text-muted-foreground group-hover:text-primary h-4 w-4" />
            <span className="text-muted-foreground group-hover:text-foreground text-xs font-bold">
              Global Patient Search
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
