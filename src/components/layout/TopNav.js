'use client';

import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui';
import { cn } from '@/lib/cn';

function TopNav({ title, className }) {
  return (
    <header
      className={cn(
        'border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur lg:px-6',
        className
      )}
    >
      {/* Page Title - offset for mobile menu button */}
      <h1 className="text-foreground pl-12 text-lg font-semibold lg:pl-0">{title}</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* User Avatar */}
        <button
          className="bg-muted text-muted-foreground hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          aria-label="User menu"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export { TopNav };
