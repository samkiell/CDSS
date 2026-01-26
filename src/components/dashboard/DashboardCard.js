'use client';

import { cn } from '@/lib/cn';

export function DashboardCard({ children, title, className, headerAction }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-[2rem] border border-gray-50 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {(title || headerAction) && (
        <div className="mb-6 flex items-center justify-between px-2">
          {title && (
            <h3 className="text-lg font-black tracking-tight text-gray-900">{title}</h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
