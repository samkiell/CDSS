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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import { Activity, PieChart as PieIcon, Target } from 'lucide-react';

const RISK_COLORS = {
  Low: '#10b981',
  Moderate: '#f59e0b',
  Urgent: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <p className="mb-1 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor:
                payload[0].color || payload[0].payload.fill || 'hsl(var(--primary))',
            }}
          />
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {payload[0].value}
          </span>
          {payload[0].name === 'Intensity' && (
            <span className="text-[10px] font-bold text-slate-400 uppercase">Level</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProgressCharts({
  painHistory = [],
  riskDistribution = {},
  bodyRegionData = [],
}) {
  const riskChartData = Object.entries(riskDistribution)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: RISK_COLORS[name] || '#6b7280',
    }));

  const totalRisk = riskChartData.reduce((sum, item) => sum + item.value, 0);

  // Prepare radar chart data for body regions
  const radarData = bodyRegionData.map((item) => ({
    subject: item.name,
    value: item.value,
    fullMark: Math.max(...bodyRegionData.map((d) => d.value), 5),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pain History Line Chart */}
      <Card className="overflow-hidden border-none shadow-2xl ring-1 ring-slate-100 lg:col-span-2 dark:ring-slate-800">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-8 dark:border-slate-800/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary shadow-primary/20 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg">
                <Activity size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  Recovery Curve
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Longitudinal pain intensity tracking
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          {painHistory.length === 0 ? (
            <div className="flex h-[380px] flex-col items-center justify-center rounded-[2.5rem] bg-slate-50/50 text-center dark:bg-slate-900/20">
              <Activity className="mb-6 h-16 w-16 text-slate-200" />
              <p className="text-xl font-black text-slate-900 dark:text-white">
                Awaiting Assessment Data
              </p>
              <p className="mt-2 max-w-[280px] text-sm font-medium text-slate-400">
                Complete your daily clinical check-ins to generate your diagnostic
                progression map.
              </p>
            </div>
          ) : (
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={painHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                    <filter id="curveShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="12"
                        stdDeviation="12"
                        floodColor="hsl(var(--primary))"
                        floodOpacity="0.25"
                      />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="6 6"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    dy={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    name="Intensity"
                    stroke="url(#curveGrad)"
                    strokeWidth={6}
                    filter="url(#curveShadow)"
                    dot={{
                      r: 7,
                      fill: 'white',
                      strokeWidth: 4,
                      stroke: 'hsl(var(--primary))',
                    }}
                    activeDot={{
                      r: 10,
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 5,
                      stroke: 'white',
                    }}
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Severity Pie Chart */}
      <Card className="border-none shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <PieIcon size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                Clinical Risk
              </CardTitle>
              <CardDescription className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Severity Breakdown
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalRisk === 0 ? (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl bg-slate-50/50 text-center dark:bg-slate-900/20">
              <PieIcon className="mb-4 h-12 w-12 text-slate-200" />
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
                Matrix Empty
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="relative h-[250px] w-full max-w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      innerRadius={85}
                      outerRadius={115}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={12}
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl leading-none font-black text-slate-900 dark:text-white">
                    {totalRisk}
                  </span>
                  <span className="mt-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    Cases
                  </span>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                {riskChartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 12px ${item.color}44`,
                      }}
                    />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500 dark:bg-slate-800">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anatomical Radar Chart */}
      <Card className="border-none shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Target size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                Anatomy Focus
              </CardTitle>
              <CardDescription className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Regional Distribution
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bodyRegionData.length === 0 ? (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl bg-slate-50/50 text-center dark:bg-slate-900/20">
              <Target className="mb-4 h-12 w-12 text-slate-200" />
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
                No Region Map
              </p>
            </div>
          ) : (
            <div className="h-[380px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={radarData}
                  margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
                >
                  <PolarGrid stroke="hsl(var(--border))" opacity={0.6} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: 'hsl(var(--foreground))',
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      textAnchor: 'middle',
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 'auto']}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Cases"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    dot={{
                      r: 5,
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 3,
                      stroke: 'white',
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
