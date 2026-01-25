'use client';

import { User, Menu } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store';

function TopNav({ title, className, showSidebarTrigger = true, showUser = true }) {
  const { toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        'border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur lg:px-6',
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
        <Link
          href="/"
          className={cn(
            'flex items-center transition-opacity hover:opacity-80',
            session && 'lg:hidden'
          )}
        >
          <Logo size="md" showText={false} />
        </Link>

        {/* Page Title */}
        {title && (
          <h1 className="text-foreground ml-1 text-sm font-semibold sm:text-lg">
            {title}
          </h1>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* User Avatar - only if showUser is true */}
        {showUser && (
          <button
            className="bg-muted text-muted-foreground hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}

export { TopNav };
