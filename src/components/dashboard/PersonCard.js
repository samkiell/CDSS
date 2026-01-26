'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function PersonCard({
  name,
  sex,
  meta,
  statusColor = 'green',
  isUrgent = false,
}) {
  return (
    <div className="bg-card text-card-foreground border-border group flex items-center justify-between rounded-[2rem] border p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-4">
        {/* Avatar Container */}
        <div className="bg-muted border-background relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm">
          <div className="text-muted-foreground/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-foreground text-base leading-tight font-black tracking-tight">
              {name}
            </h4>
            {isUrgent && (
              <div className="flex items-center gap-1">
                <div className="bg-destructive h-2 w-2 animate-pulse rounded-full" />
                <span className="text-destructive text-[10px] font-bold tracking-wider uppercase">
                  Urgent
                </span>
              </div>
            )}
            {statusColor === 'green' && !isUrgent && (
              <div className="bg-success h-2 w-2 rounded-full" />
            )}
            {statusColor === 'yellow' && !isUrgent && (
              <div className="bg-warning h-2 w-2 rounded-full" />
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-bold capitalize">
              {sex}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-muted-foreground text-xs font-bold">{meta}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="rounded-xl bg-[#3da9f5] px-6 py-2 text-xs font-black text-white shadow-[0_4px_12px_rgba(61,169,245,0.25)] transition-all hover:scale-105 hover:bg-[#2c91db] active:scale-95">
          Details
        </button>
        <button className="border-destructive text-destructive hover:bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all group-hover:rotate-90">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
