'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Play } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

const data = [
  { name: 'Active', value: 65, color: '#3da9f5' },
  { name: 'Inactive', value: 35, color: 'currentColor' }, // Using currentColor for inactive to match theme
];

export default function ActivityDonutChart({ title, type = 'Users' }) {
  const headerAction = (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-[11px] font-bold">9:30am</span>
      <button className="bg-foreground text-background flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90">
        <Play className="ml-0.5 h-3 w-3 fill-current" />
      </button>
    </div>
  );

  return (
    <DashboardCard title={title} headerAction={headerAction}>
      <div className="flex h-full flex-col items-center justify-center py-2">
        <div className="relative h-48 w-full max-w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Active' ? entry.color : 'rgba(156, 163, 175, 0.2)'
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-foreground text-2xl leading-none font-black">
              Today
            </span>
            <span className="text-muted-foreground mt-1 text-[10px] font-bold tracking-widest uppercase">
              {type}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid w-full grid-cols-2 gap-x-8 gap-y-2 px-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    item.name === 'Active' ? item.color : 'rgba(156, 163, 175, 0.4)',
                }}
              />
              <span className="text-muted-foreground text-xs font-bold">{item.name}</span>
              <span className="text-foreground ml-auto text-xs font-black">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
