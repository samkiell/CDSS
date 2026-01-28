'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

const DropdownMenu = ({ children, ...props }) => {
  return (
    <div className="relative inline-block text-left" {...props}>
      {children}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  return (
    <div ref={ref} className="cursor-pointer" {...props}>
      {children}
    </div>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(
  ({ className, children, align = 'end', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-popover text-popover-foreground absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md transition-all',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
