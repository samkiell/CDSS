'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="bg-primary h-2 w-2 rounded-full" />
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {payload[0].value}
          </span>
          <span className="text-xs font-medium text-slate-500">/ 10</span>
        </div>
        <p className="text-primary mt-1 text-[10px] font-medium">Intensity Level</p>
      </div>
    );
  }
  return null;
};

export default function PainChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-8 text-center dark:border-slate-800/50 dark:bg-slate-900/20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Activity className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-white">
          No Activity Recorded
        </p>
        <p className="mt-1 max-w-[200px] text-sm text-slate-500">
          Complete your first assessment to begin tracking your recovery.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-4 h-80 w-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute top-6 left-6 z-10">
        <div className="text-primary flex items-center gap-2">
          <TrendingUp size={16} />
          <span className="text-xs font-bold tracking-widest uppercase">Pain Trend</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 60, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
            dy={15}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'hsl(var(--primary))',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="hsl(var(--primary))"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#painGradient)"
            filter="url(#glow)"
            dot={{
              r: 5,
              fill: 'hsl(var(--primary))',
              strokeWidth: 2,
              stroke: 'white',
            }}
            activeDot={{
              r: 8,
              strokeWidth: 4,
              stroke: 'white',
              fill: 'hsl(var(--primary))',
              className: 'animate-pulse',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
