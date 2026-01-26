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
  Legend,
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
  Low: '#22c55e',
  Moderate: '#eab308',
  Urgent: '#ef4444',
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="text-primary h-5 w-5" />
            <CardTitle>Pain Intensity Over Time</CardTitle>
          </div>
          <CardDescription>
            Track how your pain levels have changed across assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {painHistory.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-xl bg-muted/30 text-center">
              <Activity className="text-muted-foreground/40 mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                No pain history data available yet
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Complete assessments with pain intensity to see your trend
              </p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={painHistory}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '0.75rem',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                      padding: '12px 16px',
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                    labelStyle={{
                      color: 'hsl(var(--foreground))',
                      fontWeight: 'bold',
                      marginBottom: 4,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    name="Pain Level"
                    stroke="url(#lineGradient)"
                    strokeWidth={4}
                    filter="url(#shadow)"
                    dot={{
                      r: 6,
                      fill: 'hsl(var(--card))',
                      strokeWidth: 3,
                      stroke: 'hsl(var(--primary))',
                    }}
                    activeDot={{
                      r: 8,
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 4,
                      stroke: 'hsl(var(--card))',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieIcon className="text-primary h-5 w-5" />
            <CardTitle>Risk Level Distribution</CardTitle>
          </div>
          <CardDescription>
            Breakdown of risk levels across your assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalRisk === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center rounded-xl bg-muted/30 text-center">
              <PieIcon className="text-muted-foreground/40 mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                No risk data available
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-[220px] w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <Pie
                      data={riskChartData}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      filter="url(#pieShadow)"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-foreground text-3xl font-bold">{totalRisk}</span>
                  <span className="text-muted-foreground text-xs font-medium">
                    Assessments
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                {riskChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground text-sm font-medium">{item.name}</span>
                    <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body Region Radar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="text-primary h-5 w-5" />
            <CardTitle>Body Region Analysis</CardTitle>
          </div>
          <CardDescription>
            Visual map of assessed body regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bodyRegionData.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center rounded-xl bg-muted/30 text-center">
              <Target className="text-muted-foreground/40 mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                No body region data available
              </p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <PolarGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 'auto']}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 10,
                    }}
                    axisLine={false}
                  />
                  <Radar
                    name="Assessments"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#radarGradient)"
                    dot={{
                      r: 4,
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 2,
                      stroke: 'hsl(var(--card))',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '0.75rem',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
