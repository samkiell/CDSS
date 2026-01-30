'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Cpu, Shield, Lock, Database, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/admin/settings/profile', label: 'Admin Profile', icon: User },
  { href: '/admin/settings/system', label: 'System Settings', icon: Cpu },
  { href: '/admin/settings/roles', label: 'Role & Access', icon: Shield },
  { href: '/admin/settings/security', label: 'Security & Privacy', icon: Lock },
  { href: '/admin/settings/audit', label: 'Audit & Logs', icon: Database },
];

export default function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl p-5 transition-all',
              isActive
                ? 'bg-primary scale-[1.02] text-white shadow-sm'
                : 'hover:bg-muted/50 text-foreground'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'h-6 w-6',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )}
              >
                <Icon size={24} />
              </div>
              <span className="text-sm font-bold tracking-tight uppercase">
                {item.label}
              </span>
            </div>
            <ChevronRight className={cn('h-4 w-4 opacity-50', !isActive && 'hidden')} />
          </Link>
        );
      })}
    </div>
  );
}
