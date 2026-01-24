'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      className={cn(
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
        className
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export { ThemeToggle };
