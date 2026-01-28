'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('relative overflow-auto', className)} {...props}>
    <div className="h-full w-full rounded-[inherit]">{children}</div>
  </div>
));
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
