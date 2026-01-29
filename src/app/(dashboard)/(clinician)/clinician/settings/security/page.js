'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema } from '@/lib/validations/clinician-settings';
import { useClinicianSettings } from '@/hooks/useClinicianSettings';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Badge,
  StatusModal,
} from '@/components/ui';
import { Loader2, Shield, Smartphone, LogOut, Laptop, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function SecurityPage() {
  const { securitySettings, isLoading, changePassword, toggle2FA, logoutAllSessions } =
    useClinicianSettings();

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = (data) => {
    changePassword.mutate(data, {
      onSuccess: () => passwordForm.reset(),
    });
  };

  const handle2FAChange = (checked) => {
    toggle2FA.mutate(checked);
  };

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const handleLogoutSessions = () => {
    setStatusModal({
      isOpen: true,
      type: 'warning',
      title: 'Log Out All Sessions',
      message:
        'Are you sure you want to log out of all other devices? This will invalidate all other active sessions.',
      onConfirm: () => {
        logoutAllSessions.mutate(undefined, {
          onSettled: () => {
            setStatusModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      },
      confirmText: 'Log Out All',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-5 w-5" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enable 2FA</Label>
              <p className="text-muted-foreground text-sm">
                Secure your account with two-factor authentication.
              </p>
            </div>
            <Switch
              checked={securitySettings?.twoFactorEnabled || false}
              onCheckedChange={handle2FAChange}
              disabled={toggle2FA.isPending}
            />
          </div>
          {securitySettings?.twoFactorEnabled && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Two-factor authentication is currently active.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="max-w-md space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
                error={passwordForm.formState.errors.currentPassword?.message}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
                error={passwordForm.formState.errors.newPassword?.message}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
                error={passwordForm.formState.errors.confirmPassword?.message}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices where you are currently logged in.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutSessions}
              disabled={logoutAllSessions.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out all other sessions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securitySettings?.activeSessions?.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-full p-2">
                    {session.device.toLowerCase().includes('phone') ? (
                      <Smartphone className="text-muted-foreground h-5 w-5" />
                    ) : (
                      <Laptop className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      {session.device}
                      {session.isCurrent && (
                        <Badge variant="secondary" className="h-5 px-1 py-0 text-[10px]">
                          Current Device
                        </Badge>
                      )}
                    </h4>
                    <div className="text-muted-foreground mt-1 flex gap-4 text-xs">
                      <span>{session.ip}</span>
                      <span>
                        Last active:{' '}
                        {session.lastActive
                          ? new Date(session.lastActive).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Account created on:{' '}
                {securitySettings?.createdAt
                  ? format(new Date(securitySettings.createdAt), 'PPP')
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onConfirm={statusModal.onConfirm}
        confirmText={statusModal.confirmText || 'Continue'}
        isSubmitting={logoutAllSessions.isPending}
      />
    </div>
  );
}
