'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Play } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { useTheme } from 'next-themes';

const data = [
  { name: 'Active', value: 65, color: 'hsl(var(--primary))' },
  { name: 'Inactive', value: 35, color: 'hsl(var(--muted))' },
];

export default function ActivityDonutChart({ title, type = 'Users' }) {
  const headerAction = (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-[10px] font-bold">9:30am</span>
      <button className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-full shadow transition-transform hover:scale-105">
        <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
      </button>
    </div>
  );

  return (
    <DashboardCard title={title} headerAction={headerAction}>
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative h-40 w-full max-w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-foreground text-xl leading-none font-black">Today</span>
            <span className="text-muted-foreground mt-1 text-[9px] font-bold tracking-widest uppercase">
              {type}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid w-full grid-cols-2 gap-4 px-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground text-[10px] font-bold">
                {item.name}
              </span>
              <span className="text-foreground ml-auto text-[10px] font-black">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
