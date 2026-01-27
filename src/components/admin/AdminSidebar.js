'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardList,
  Stethoscope,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { signOut } from 'next-auth/react';
import { useUIStore } from '@/store';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/therapists', label: 'Therapists', icon: UserRound },
  { href: '/admin/sessions', label: 'Sessions', icon: ClipboardList },
  { href: '/admin/diagnostics', label: 'Guided Diagnostics', icon: Stethoscope },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

const footerItems = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/help', label: 'Help', icon: HelpCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 dark:border-gray-800 dark:bg-gray-900',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6 dark:border-gray-800">
          <Link
            href="/admin/dashboard"
            className="relative h-24 w-32"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="CDSS Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <button
            className="text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary shadow-primary/20 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                )}
              >
                <Icon
                  className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400')}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <div className="space-y-1">
            {footerItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <Icon className="h-5 w-5 text-gray-400" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setSidebarOpen(false);
                signOut({ callbackUrl: '/admin' });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
