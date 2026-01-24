'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function VerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const handleOTPComplete = (otp) => {
    setOtpValue(otp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpValue.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setIsLoading(true);

    try {
      // Placeholder for actual verification logic
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Email verified successfully!');
      router.push('/login');
    } catch (_) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Placeholder for resend logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Verification code resent!');
    } catch (_) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="animate-fade-in mb-8">
        <Logo size="lg" />
      </div>

      {/* Verify Card */}
      <Card className="animate-slide-up w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            A verification code has been sent to your email address. Please enter it
            below.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center">
              <OTPInput length={6} onComplete={handleOTPComplete} />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Verify
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <p className="text-muted-foreground text-sm">Didn&apos;t receive the code?</p>
          <Button variant="ghost" size="sm" onClick={handleResend}>
            Resend Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
