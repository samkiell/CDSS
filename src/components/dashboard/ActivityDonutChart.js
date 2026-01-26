'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Play } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

const data = [
  { name: 'Active', value: 65, color: '#3da9f5' },
  { name: 'Inactive', value: 35, color: '#e5e7eb' },
];

export default function ActivityDonutChart({ title, type = 'Users' }) {
  const headerAction = (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-gray-400">9:30am</span>
      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-110 active:scale-90">
        <Play className="ml-0.5 h-3 w-3 fill-white" />
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl leading-none font-black text-gray-900">Today</span>
            <span className="mt-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
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
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold text-gray-600">{item.name}</span>
              <span className="ml-auto text-xs font-black text-gray-900">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
