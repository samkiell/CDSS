'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store';
import Image from 'next/image';

function TopNav({ title, className, showSidebarTrigger = true, showUser = true }) {
  const { toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  const userName = session?.user?.lastName ? `Dr. ${session.user.lastName}` : 'Dr. Ajayi';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-24 items-center justify-between bg-white px-4 lg:px-10',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button - only if showSidebarTrigger is true */}
        {showSidebarTrigger && (
          <button
            className="hover:bg-accent text-foreground block rounded-lg transition-colors lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Logo - Hide on PC if logged in (Sidebar has it) */}
        {!session && (
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Logo size="md" showText={false} />
          </Link>
        )}

        {/* Welcome Message */}
        <div className="flex flex-col">
          <h1 className="text-foreground text-xl font-bold lg:text-2xl">
            Welcome Back, {userName}!
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* User Avatar - only if showUser is true */}
        {showUser && (
          <button
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm transition-transform hover:scale-105"
            aria-label="User menu"
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
              <div className="h-full w-full bg-gray-200" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export { TopNav };
