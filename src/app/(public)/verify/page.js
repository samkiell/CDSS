'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Logo,
  Button,
  OTPInput,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { toast } from 'sonner';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Countdown state (in seconds)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Verification Error', {
        description: 'No email provided for verification. Please go back and try again.',
      });
    }
  }, [email]);

  // Countdown logic
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const sendOtp = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('Code Resent', {
        description: `A new verification code has been sent to ${email}`,
      });
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      toast.error('Resend Failed', {
        description: err.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        toast.success('Verification Successful', {
          description: 'Your email has been verified. Redirecting to login...',
        });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(true);
        toast.error('Verification Failed', {
          description: data.error || 'The code you entered is invalid or expired.',
        });
      }
    } catch (err) {
      setError(true);
      toast.error('Connection Error', {
        description:
          'Could not connect to the server. Please check your internet connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="animate-fade-in mb-8">
        <Logo size="lg" />
      </div>

      {/* Verify Card */}
      <Card className="animate-slide-up border-muted/20 bg-card/50 w-full max-w-md backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            We've sent a 4-digit code to{' '}
            <span className="text-foreground font-semibold">{email || 'your email'}</span>
            . Please enter it below to verify your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6 pt-2">
            {/* OTP Input */}
            <div className="flex justify-center">
              <OTPInput
                length={4}
                onComplete={handleOTPComplete}
                disabled={isLoading || isVerified}
                error={error}
              />
            </div>

            {isLoading && (
              <p className="text-primary animate-pulse text-center text-sm font-medium">
                Verifying code...
              </p>
            )}

            {isVerified && (
              <p className="text-success text-center text-sm font-medium">
                ✓ Verification successful! Redirecting...
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 pb-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Didn't receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={sendOtp}
              disabled={!canResend || isResending || isLoading || isVerified}
              className="text-primary hover:text-primary/80 mt-1 font-semibold"
            >
              {isResending
                ? 'Sending...'
                : canResend
                  ? 'Resend Code'
                  : `Resend in ${countdown}s`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
