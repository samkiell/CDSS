'use client';

import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store';
import Image from 'next/image';

function TopNav({ title, className, showSidebarTrigger = true, showUser = true }) {
  const { toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  const userName = session?.user?.firstName
    ? `Dr. ${session.user.lastName || session.user.firstName}`
    : 'Dr. Ajayi';

  return (
    <header
      className={cn(
        'border-border bg-background/95 sticky top-0 z-30 flex h-20 items-center justify-between border-b px-4 backdrop-blur-sm lg:px-10',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {showSidebarTrigger && (
          <button
            className="hover:bg-accent text-foreground block rounded-lg p-2 transition-colors lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Welcome Text */}
        <div className="flex flex-col">
          <h1 className="text-foreground text-xl font-black tracking-tight lg:text-2xl">
            Welcome Back, {userName}!
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* User Image Profile */}
        {showUser && (
          <button
            className="border-background flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition-transform hover:scale-105"
            aria-label="User menu"
            onClick={async () => {
              if (window.confirm('Do you want to sign out?')) {
                const { signOut } = await import('next-auth/react');
                const { useAuthStore, useDiagnosisStore, useAssessmentStore } =
                  await import('@/store');

                useAuthStore.getState().logout?.();
                useDiagnosisStore.getState().reset?.();
                useAssessmentStore.getState().resetAssessment?.();

                await signOut({ redirectTo: '/' });
              }
            }}
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <Image
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export { TopNav };
