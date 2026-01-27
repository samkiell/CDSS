'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  FileText,
  ClipboardList,
  Clock,
  MessageSquare,
  AlertCircle,
  Bell,
  CheckCircle2,
  Construction,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { cn } from '@/lib/cn';

const typeIcons = {
  Assessments: <Sparkles className="h-5 w-5" />,
  Appointments: <Calendar className="h-5 w-5" />,
  Treatments: <FileText className="h-5 w-5" />,
  Messages: <MessageSquare className="h-5 w-5" />,
  System: <AlertCircle className="h-5 w-5" />,
};

const typeColors = {
  Assessments: 'bg-primary/10 text-primary',
  Appointments: 'bg-indigo-500/10 text-indigo-500',
  Treatments: 'bg-amber-500/10 text-amber-500',
  Messages: 'bg-emerald-500/10 text-emerald-500',
  System: 'bg-red-500/10 text-red-500',
};

export default function NotificationsClient({ initialNotifications = [] }) {
  const [activeTab, setActiveTab] = useState('All');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return initialNotifications;
    return initialNotifications.filter((n) => n.type === activeTab);
  }, [initialNotifications, activeTab]);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="All" className="w-full" onValueChange={setActiveTab}>
        <div className="border-border/50 flex items-center justify-between border-b pb-4">
          <TabsList className="bg-muted/30 h-12 rounded-2xl p-1">
            <TabsTrigger
              value="All"
              className="h-full rounded-xl px-6 text-[10px] font-black tracking-widest uppercase"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger
              value="Assessments"
              className="h-full rounded-xl px-6 text-[10px] font-black tracking-widest uppercase"
            >
              Assessments
            </TabsTrigger>
            <TabsTrigger
              value="Appointments"
              className="h-full rounded-xl px-6 text-[10px] font-black tracking-widest uppercase"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="Treatments"
              className="h-full rounded-xl px-6 text-[10px] font-black tracking-widest uppercase"
            >
              Treatments
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            className="text-primary gap-2 text-[10px] font-black tracking-widest uppercase"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>

        <div className="space-y-4 pt-8">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <Card
                key={notif._id}
                className={cn(
                  'group bg-card relative overflow-hidden rounded-[2rem] border-none shadow-sm transition-all hover:shadow-md',
                  notif.status === 'Unread' && 'ring-primary/20 ring-2'
                )}
              >
                <CardContent className="flex items-start gap-6 p-6 sm:p-8">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
                      typeColors[notif.type] || 'bg-muted text-muted-foreground'
                    )}
                  >
                    {typeIcons[notif.type] || <Bell className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-foreground text-base font-black tracking-tight uppercase italic">
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase opacity-50">
                          <Clock className="h-3 w-3" />
                          {formatTime(notif.createdAt)}
                        </span>
                        {notif.status === 'Unread' && (
                          <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed font-medium">
                      {notif.description}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center gap-6 py-20 text-center opacity-30">
              <div className="bg-muted/50 flex h-20 w-20 items-center justify-center rounded-[2rem]">
                <Bell className="h-10 w-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tighter uppercase italic">
                  All Caught Up
                </h4>
                <p className="text-sm font-medium">
                  No new notifications in this category.
                </p>
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  return date.toLocaleDateString();
}
