'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  MoreVertical,
  User as UserIcon,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  StatusModal,
} from '@/components/ui';

import { cn } from '@/lib/cn';

export default function AdminUserListClient({ initialUsers = [] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      const isUserVerified =
        user.role === 'CLINICIAN' ? user.professional?.verified : user.isVerified;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' ? isUserVerified : !isUserVerified);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [initialUsers, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: initialUsers.length,
      patients: initialUsers.filter((u) => u.role === 'PATIENT').length,
      clinicians: initialUsers.filter((u) => u.role === 'CLINICIAN').length,
      unverified: initialUsers.filter((u) =>
        u.role === 'CLINICIAN' ? !u.professional?.verified : !u.isVerified
      ).length,
    };
  }, [initialUsers]);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success('User role updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  const handleDelete = (userId) => {
    setStatusModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete user');
          toast.success('User deleted successfully');
          setStatusModal((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        } catch (error) {
          toast.error('Failed to delete user');
        }
      },
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<UserIcon className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Patients"
          value={stats.patients}
          icon={<UserIcon className="h-6 w-6" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="Clinicians"
          value={stats.clinicians}
          icon={<Stethoscope className="h-6 w-6" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Unverified"
          value={stats.unverified}
          icon={<Clock className="h-6 w-6" />}
          color="bg-amber-500"
        />
      </div>

      {/* Controls */}
      <Card className="bg-card rounded-[2rem] border-none shadow-sm">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border bg-muted/30 focus:ring-primary/20 h-14 w-full rounded-2xl pr-4 pl-12 text-sm font-medium focus:ring-2 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-muted/30 flex items-center gap-2 rounded-2xl p-1">
                {['ALL', 'PATIENT', 'CLINICIAN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all',
                      roleFilter === role
                        ? 'text-primary bg-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-border bg-muted/30 h-11 rounded-xl px-4 text-xs font-bold tracking-widest uppercase focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Unverified Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card overflow-hidden rounded-[2.5rem] border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border bg-muted/20 border-b">
                <th className="text-muted-foreground p-6 text-[10px] font-bold tracking-widest uppercase">
                  User Details
                </th>
                <th className="text-muted-foreground p-6 text-[10px] font-bold tracking-widest uppercase">
                  Account Role
                </th>
                <th className="text-muted-foreground p-6 text-[10px] font-bold tracking-widest uppercase">
                  Verification
                </th>
                <th className="text-muted-foreground p-6 text-[10px] font-bold tracking-widest uppercase">
                  Joined Date
                </th>
                <th className="text-muted-foreground p-6 text-right text-[10px] font-bold tracking-widest uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/50 divide-y">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="ring-border/50 group-hover:ring-primary/20 h-12 w-12 rounded-2xl ring-2 transition-all">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-bold">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge
                        className={cn(
                          'rounded-full border-none px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase',
                          user.role === 'CLINICIAN'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-6">
                      {(
                        user.role === 'CLINICIAN'
                          ? user.professional?.verified
                          : user.isVerified
                      ) ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-bold tracking-widest uppercase">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-bold tracking-widest uppercase">
                            Pending
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'PATIENT' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                            className="hover:bg-primary/10 hover:text-primary h-9 w-9 rounded-xl"
                            title="View Case File"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-2xl p-2"
                          >
                            {user.role === 'PATIENT' && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(user._id, 'CLINICIAN')}
                                className="flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase"
                              >
                                <Stethoscope className="h-4 w-4" />
                                Make Therapist
                              </DropdownMenuItem>
                            )}

                            {user.role === 'CLINICIAN' && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(user._id, 'PATIENT')}
                                className="flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase"
                              >
                                <UserIcon className="h-4 w-4" />
                                Make Patient
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleDelete(user._id)}
                              className="text-destructive flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-muted-foreground p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <UserIcon className="h-12 w-12 opacity-20" />
                      <p className="text-foreground text-xl font-bold tracking-tight uppercase opacity-30">
                        No users found
                      </p>
                      <p className="text-sm font-medium">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onConfirm={statusModal.onConfirm}
        confirmText={statusModal.confirmText}
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card className="bg-card group overflow-hidden rounded-[2rem] border-none shadow-sm">
      <CardContent className="flex items-center gap-6 p-8">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110',
            color
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
            {title}
          </p>
          <h3 className="text-foreground text-3xl font-bold tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
