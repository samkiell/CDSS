'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  FileText,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from '@/components/ui';
import SettingsNavigation from '@/components/admin/SettingsNavigation';
import { cn } from '@/lib/cn';

function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: async () => {
      const url = new URL('/api/admin/settings/audit', window.location.origin);
      url.searchParams.set('page', page);
      if (actionFilter) url.searchParams.set('action', actionFilter);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    },
  });

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-2 px-2">
        <h2 className="text-foreground text-3xl font-bold tracking-tight uppercase">
          System Audit Logs
        </h2>
        <p className="text-muted-foreground font-medium">
          Immutable record of all administrative actions and system security events.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <SettingsNavigation />
        </div>

        <div className="space-y-8 lg:col-span-3">
          {/* Controls */}
          <Card className="bg-card rounded-[2rem] border-none shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                  <Input
                    placeholder="Search by action type..."
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="bg-muted/30 focus:ring-primary/20 h-14 w-full rounded-2xl border-none pr-4 pl-12 text-sm font-medium focus:ring-2"
                  />
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="h-14 gap-2 rounded-2xl px-6 font-bold uppercase transition-all"
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card className="bg-card overflow-hidden rounded-[2.5rem] border-none shadow-sm">
            <CardHeader className="border-border bg-muted/10 border-b p-8">
              <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight uppercase">
                <Database className="text-primary h-6 w-6" />
                Action History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-border/50 divide-y">
                {isLoading ? (
                  <div className="p-20 text-center">
                    <RefreshCw className="text-primary/20 mx-auto h-10 w-10 animate-spin" />
                  </div>
                ) : data?.logs?.length > 0 ? (
                  data.logs.map((log) => (
                    <div
                      key={log._id}
                      className="group hover:bg-muted/5 flex items-center justify-between p-6 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground flex items-center gap-2 text-sm font-bold">
                            {log.action}
                            <Badge
                              variant="secondary"
                              className="bg-muted border-none px-2 py-0 text-[8px] font-bold uppercase"
                            >
                              {log.adminId?.email?.split('@')[0] || 'System'}
                            </Badge>
                          </p>
                          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-60">
                            By {log.adminId?.firstName} {log.adminId?.lastName} •{' '}
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {log.targetUserId && (
                          <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold uppercase">
                            <UserIcon className="h-3 w-3" />
                            Target: {log.targetUserId?.firstName}
                          </div>
                        )}
                        <span className="text-muted-foreground bg-muted/30 rounded-lg px-2 py-1 text-[10px] font-medium">
                          {formatTimeAgo(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-muted-foreground text-sm">
                      No audit logs found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex items-center justify-between px-2">
              <p className="text-muted-foreground text-xs font-bold uppercase">
                Showing {(page - 1) * data.pagination.limit + 1} -{' '}
                {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
