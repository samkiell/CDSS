'use client';

import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/cn';

export function DashboardCard({ children, title, className, headerAction }) {
  return (
    <Card className={cn('overflow-hidden rounded-2xl', className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between p-6 pb-0">
          {title && <h3 className="text-lg font-black tracking-tight">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <CardContent className={cn('p-6', (title || headerAction) && 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
}
