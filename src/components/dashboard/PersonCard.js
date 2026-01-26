'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function PersonCard({
  name,
  sex,
  meta,
  statusColor = 'green',
  isUrgent = false,
}) {
  return (
    <Card className="border-border group rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold shadow-sm">
            {name?.[0] || 'P'}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="text-sm leading-tight font-black tracking-tight">{name}</h4>
              {isUrgent ? (
                <div className="flex items-center gap-1">
                  <div className="bg-destructive h-2 w-2 animate-pulse rounded-full" />
                  <span className="text-destructive text-[9px] font-bold tracking-wider whitespace-nowrap uppercase">
                    Urgent
                  </span>
                </div>
              ) : (
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusColor === 'green' ? 'bg-success' : 'bg-warning'
                  )}
                />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] font-bold capitalize">
                {sex}
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-muted-foreground text-[10px] font-bold">{meta}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-primary h-8 rounded-lg text-[10px] font-black tracking-wider uppercase"
          >
            Details
          </Button>
          <button className="border-destructive text-destructive hover:bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-full border transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
