'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
