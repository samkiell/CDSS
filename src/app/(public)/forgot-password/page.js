'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Logo,
  Button,
  Input,
  PasswordInput,
  OTPInput,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // 'email' → request a code; 'reset' → enter code + new password.
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // The step swaps content in place, so reset scroll when moving between steps.
  useScrollToTop(step);

  // Resend countdown
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const requestCode = async (targetEmail) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send reset code.');
    return data;
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await requestCode(email);
      toast.success('Check your email', {
        description: `If an account exists for ${email}, a reset code is on its way.`,
      });
      setStep('reset');
      setCountdown(60);
    } catch (err) {
      toast.error('Request failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await requestCode(email);
      toast.success('Code resent', { description: `A new code was sent to ${email}.` });
      setCountdown(60);
    } catch (err) {
      toast.error('Resend failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      return toast.error('Enter the 4-digit code from your email.');
    }
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not reset password.');

      toast.success('Password reset', {
        description: 'You can now sign in with your new password.',
      });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      toast.error('Reset failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <div className="animate-fade-in mb-8 pt-12">
        <Logo size="lg" />
      </div>

      <Card className="animate-slide-up w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {step === 'email' ? 'Forgot your password?' : 'Reset your password'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email and we’ll send you a code to reset it.'
              : 'Enter the code we emailed you and choose a new password.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-foreground text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Send reset code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  Verification code
                </label>
                <p className="text-muted-foreground text-xs">
                  Sent to <span className="text-foreground font-medium">{email}</span>
                </p>
                <div className="flex justify-center pt-1">
                  <OTPInput length={4} onComplete={(val) => setOtp(val)} />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-foreground text-sm font-medium"
                >
                  New password
                </label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-foreground text-sm font-medium"
                >
                  Confirm new password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Reset password
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading}
                  className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-60"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
