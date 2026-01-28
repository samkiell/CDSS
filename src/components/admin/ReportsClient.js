'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  Users,
  Stethoscope,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export default function AdminReportsClient({ stats }) {
  return (
    <div className="space-y-10 pb-12">
      {/* Action Bar */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="bg-muted/30 flex items-center gap-4 rounded-2xl p-1">
          <Button
            variant="ghost"
            className="h-11 rounded-xl bg-white px-6 text-[10px] font-bold tracking-widest uppercase shadow-sm"
          >
            Standard
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground h-11 rounded-xl px-6 text-[10px] font-bold tracking-widest uppercase"
          >
            Custom
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground h-11 rounded-xl px-6 text-[10px] font-bold tracking-widest uppercase"
          >
            Scheduled
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 gap-2 rounded-2xl px-6 font-bold">
            <Filter className="h-4 w-4" />
            Date Range
          </Button>
          <Button className="bg-primary h-14 gap-2 rounded-2xl px-8 text-sm font-bold tracking-widest text-white uppercase shadow-sm">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Sessions"
          value={stats.totalSessions}
          change="+12.5%"
          trend="up"
          icon={<Activity />}
        />
        <KPICard
          title="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          change="+3.2%"
          trend="up"
          icon={<TrendingUp />}
        />
        <KPICard
          title="Avg Review Time"
          value={`${stats.avgReviewTime}h`}
          change="-1.5h"
          trend="up"
          icon={<Clock />}
        />
        <KPICard
          title="Platform Health"
          value="98.2%"
          change="+0.4%"
          trend="up"
          icon={<CheckCircle2 />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted/30 h-14 w-full rounded-2xl p-1 md:w-auto">
          <TabsTrigger
            value="overview"
            className="h-full rounded-xl px-8 text-[10px] font-bold tracking-widest uppercase"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="h-full rounded-xl px-8 text-[10px] font-bold tracking-widest uppercase"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="demographics"
            className="h-full rounded-xl px-8 text-[10px] font-bold tracking-widest uppercase"
          >
            Demographics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="bg-card rounded-[2.5rem] border-none shadow-sm">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold tracking-tight uppercase">
                  Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {stats.regionalData.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold tracking-widest uppercase">
                        <span>{item.region}</span>
                        <span className="text-primary">{item.count} Cases</span>
                      </div>
                      <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${(item.count / stats.totalSessions) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-[2.5rem] border-none shadow-sm">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold tracking-tight uppercase">
                  Risk Level Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid h-full grid-cols-3 gap-4">
                  {['Urgent', 'Moderate', 'Low'].map((risk) => {
                    const count = stats.riskData[risk] || 0;
                    const percentage =
                      stats.totalSessions > 0 ? (count / stats.totalSessions) * 100 : 0;
                    return (
                      <div
                        key={risk}
                        className="bg-muted/20 border-border/50 flex flex-col items-center justify-center gap-2 rounded-[2rem] border p-6 text-center"
                      >
                        <span
                          className={cn(
                            'h-3 w-3 rounded-full',
                            risk === 'Urgent'
                              ? 'bg-red-500'
                              : risk === 'Moderate'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          )}
                        />
                        <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                          {risk}
                        </span>
                        <span className="text-foreground text-2xl font-bold">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card overflow-hidden rounded-[2.5rem] border-none shadow-sm">
            <CardHeader className="border-border bg-muted/10 border-b p-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold tracking-tight uppercase">
                  Recent Activity Log
                </CardTitle>
                <Button
                  variant="ghost"
                  className="text-primary text-[10px] font-bold tracking-widest uppercase"
                >
                  View Full Log
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-border/50 divide-y">
                {[1, 2, 3, 4].map((_, i) => (
                  <div
                    key={i}
                    className="group hover:bg-muted/5 flex items-center justify-between p-6 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-bold">
                          Diagnostic Report Generated
                        </p>
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-60">
                          Lumbar Region • Patient #1024
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-foreground text-xs font-bold">Success</span>
                      <span className="text-muted-foreground text-[10px] font-medium">
                        2m ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ title, value, change, trend, icon }) {
  return (
    <Card className="bg-card group overflow-hidden rounded-[2.5rem] border-none shadow-sm">
      <CardContent className="p-8">
        <div className="mb-6 flex items-start justify-between">
          <div className="bg-muted text-muted-foreground group-hover:bg-primary flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:text-white">
            {icon}
          </div>
          <Badge
            className={cn(
              'rounded-full border-none px-3 py-1 text-[10px] font-bold',
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-red-500/10 text-red-600'
            )}
          >
            {change}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
          {title}
        </p>
        <h3 className="text-foreground text-3xl font-bold tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}
