'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ className, children, error, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          'border-input bg-background text-foreground focus-visible:ring-ring flex h-10 w-full appearance-none rounded-lg border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="bg-background text-muted-foreground pointer-events-none absolute top-3 right-3 h-4 w-4" />
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export default Select;
