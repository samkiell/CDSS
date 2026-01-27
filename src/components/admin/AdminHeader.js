'use client';

import { Search, Bell, User, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui';
import Image from 'next/image';
import { useUIStore } from '@/store';

export default function AdminHeader() {
  const { data: session } = useSession();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md lg:left-64 lg:px-8 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-1 items-center gap-4 lg:gap-8">
        {/* Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 lg:hidden dark:bg-gray-800 dark:text-gray-400"
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap text-gray-900 lg:text-xl dark:text-white">
          Welcome Back, Admin!
        </h1>

        {/* Search Bar - Hidden on small mobile */}
        <div className="relative hidden w-full max-w-2xl md:block">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Therapists/Patients Name..."
            className="focus:border-primary/50 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50 pr-4 pl-12 text-sm transition-all outline-none focus:ring-4 dark:border-gray-800 dark:bg-gray-800/50"
          />
        </div>
      </div>

      <div className="ml-8 flex items-center gap-6">
        <ThemeToggle />

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {session?.user?.firstName} {session?.user?.lastName}
            </p>
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Super Admin
            </p>
          </div>
          <button className="border-primary/10 h-12 w-12 overflow-hidden rounded-2xl border-2 shadow-sm transition-transform hover:scale-105">
            {session?.user?.avatar ? (
              <Image
                src={session.user.avatar}
                alt="Admin Avatar"
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="bg-primary flex h-full w-full items-center justify-center text-lg font-black text-white">
                {session?.user?.firstName?.[0] || 'A'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
