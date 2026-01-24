/**
 * Input Component
 * Reusable form input
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          'flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2',
          'text-gray-900 placeholder:text-gray-400',
          'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
