'use client';

import { Menu, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggle, Button } from '@/components/ui';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function TopNav({ title, className, showSidebarTrigger = true, showUser = true }) {
  const { toggleSidebar } = useUIStore();
  const { data: session } = useSession();
  const router = useRouter();

  const role = session?.user?.role?.toUpperCase();
  const isClinician = role === 'CLINICIAN';
  const userName = session?.user?.firstName
    ? isClinician
      ? `Dr. ${session.user.lastName || session.user.firstName}`
      : session.user.firstName
    : isClinician
      ? 'Doctor'
      : 'User';

  return (
    <header
      className={cn(
        'border-border bg-background/95 sticky top-0 z-30 flex h-20 items-center justify-between border-b px-4 backdrop-blur-sm lg:px-10',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button or Logo */}
        {showSidebarTrigger && (
          <button
            className="hover:bg-accent text-foreground block rounded-lg p-2 transition-colors lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Welcome Text or Title */}
        <div className="flex flex-col">
          {session ? (
            <h1 className="text-foreground animate-fade-in text-xl font-black tracking-tight lg:text-2xl">
              Welcome Back, {userName}!
            </h1>
          ) : title ? (
            <h1 className="text-foreground animate-fade-in text-xl font-black tracking-tight lg:text-2xl">
              {title}
            </h1>
          ) : (
            <div className="animate-fade-in">
              <Logo size="lg" showText={false} className="flex-row items-center" />
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        {/* Sign In Button - Show when no session */}
        {!session && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/login')}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}

        {/* User Image Profile */}
        {showUser && session && (
          <button
            className="border-background flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition-transform hover:scale-105 sm:h-12 sm:w-12"
            aria-label="User menu"
            onClick={() => {
              const role = session?.user?.role;
              if (role === 'ADMIN') router.push('/admin/dashboard');
              else if (role === 'CLINICIAN') router.push('/clinician/settings');
              else router.push('/patient/settings');
            }}
          >
            {session?.user?.avatar || session?.user?.image ? (
              <Image
                src={session.user.avatar || session.user.image}
                alt="Profile"
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-sm font-bold sm:text-lg">
                {session?.user?.firstName?.[0] || session?.user?.email?.[0] || 'U'}
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export { TopNav };
