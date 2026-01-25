'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, Button } from '@/components/ui';

export default function SplashPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth entry animation
    setTimeout(() => setIsAnimating(true), 0);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Logo with Animation */}
      <div
        className={`transition-all duration-700 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <Logo size="xl" showText={false} />
      </div>

      {/* Title */}
      <h1
        className={`text-foreground mt-6 text-center text-2xl font-bold transition-all delay-200 duration-700 ease-out sm:text-3xl md:text-4xl ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        Clinical Decision
        <br />
        Support System
      </h1>

      {/* Subtitle */}
      <p
        className={`text-muted-foreground mt-4 max-w-md text-center transition-all delay-300 duration-700 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        Empowering healthcare professionals with intelligent diagnostic assistance
      </p>

      {/* CTA Button */}
      <div
        className={`mt-8 transition-all delay-500 duration-700 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <Button
          size="lg"
          onClick={() => router.push('/login')}
          className="min-w-50 cursor-pointer"
        >
          Get Started
        </Button>
      </div>

      {/* Version Info */}
      <p
        className={`text-muted-foreground mt-12 text-xs transition-all delay-700 duration-700 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Version 1.0.0
      </p>
    </div>
  );
}
