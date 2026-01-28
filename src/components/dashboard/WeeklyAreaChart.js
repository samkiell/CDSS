'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DashboardCard } from './DashboardCard';

const data = [
  { name: 'Mon', users: 40, therapists: 20 },
  { name: 'Tue', users: 80, therapists: 50 },
  { name: 'Wed', users: 60, therapists: 40 },
  { name: 'Thu', users: 110, therapists: 90 },
  { name: 'Fri', users: 95, therapists: 85 },
];

export default function WeeklyAreaChart() {
  return (
    <DashboardCard title="Weekly Report" className="lg:col-span-8">
      <div className="mt-4 h-[300px] w-full pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTherapists" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
                fontWeight: 700,
              }}
              domain={[0, 120]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                borderRadius: '0.75rem',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '11px',
              }}
              itemStyle={{ fontWeight: 700 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 900 }}
            />
            <Area
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
            <Area
              type="monotone"
              dataKey="therapists"
              name="Therapists"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTherapists)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
