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
  { name: 'Monday', users: 40, therapists: 20 },
  { name: 'Tuesday', users: 80, therapists: 50 },
  { name: 'Wednesday', users: 60, therapists: 40 },
  { name: 'Thursday', users: 110, therapists: 90 },
  { name: 'Friday', users: 95, therapists: 85 },
];

export default function WeeklyAreaChart() {
  return (
    <DashboardCard title="Weekly Report" className="lg:col-span-8">
      <div className="mt-4 h-[350px] w-full pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3da9f5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3da9f5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTherapists" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              domain={[0, 120]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '1.5rem',
                border: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '11px', fontWeight: 900 }}
            />
            <Area
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#3da9f5"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
            <Area
              type="monotone"
              dataKey="therapists"
              name="Therapists"
              stroke="#f97316"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorTherapists)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
