'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
export default Label;
