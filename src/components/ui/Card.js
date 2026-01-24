/**
 * Card Component
 * Reusable card container
 */

import { cn } from '@/lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div className={cn('rounded-xl bg-white p-6 shadow-md', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900', className)}>{children}</h3>
  );
}

export function CardDescription({ children, className }) {
  return <p className={cn('mt-1 text-sm text-gray-500', className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={cn('mt-4 flex items-center', className)}>{children}</div>;
}
