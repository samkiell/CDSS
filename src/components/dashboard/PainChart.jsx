'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Activity } from 'lucide-react';

export default function PainChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl bg-muted/30 p-8 text-center">
        <Activity className="text-muted-foreground/40 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm font-medium">No pain history data available yet.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Complete assessments to see your recovery trend.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={[0, 10]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              borderRadius: 'var(--radius)', 
              border: '1px solid hsl(var(--border))', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
            }}
            itemStyle={{ color: 'hsl(var(--primary))' }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
          />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIntensity)"
            dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
