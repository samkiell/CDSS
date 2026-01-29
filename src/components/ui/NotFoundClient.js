'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, Activity, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui';
import { motion } from 'motion/react';

export function NotFoundClient() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Immersive Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-primary/10 absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-primary/5 absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full blur-[150px]"
        />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        {/* Huge Stylized 404 */}
        <div className="relative mb-4 sm:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-foreground/[0.03] text-[15rem] leading-none font-black tracking-tighter select-none sm:text-[22rem]"
          >
            404
          </motion.h1>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 sm:pt-16">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <div className="bg-primary/10 absolute inset-[-20px] animate-pulse rounded-full blur-2xl" />
              <div className="bg-background/40 relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 backdrop-blur-xl sm:h-32 sm:w-32">
                <Search
                  className="text-primary h-12 w-12 sm:h-16 sm:w-16"
                  strokeWidth={1.5}
                />

                {/* Scanner Effect */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="bg-primary/40 absolute left-0 h-0.5 w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-foreground text-4xl font-black tracking-tight sm:text-6xl">
            Lost in the <span className="text-primary">System?</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-lg leading-relaxed sm:text-xl">
            The diagnosis is in: the page you're searching for seems to have vanished or
            moved to a different observation room.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-12 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
        >
          <Link href="/" className="group w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 relative h-14 w-full gap-3 overflow-hidden rounded-2xl px-8 text-base font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
            </Button>
          </Link>

          <Link href="/help" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="bg-background/20 border-border/50 hover:bg-background/40 h-14 w-full gap-3 rounded-2xl px-8 text-base font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Help Center
            </Button>
          </Link>
        </motion.div>

        {/* Navigation Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="border-border/10 mt-20 grid w-full grid-cols-2 gap-12 border-t pt-10 text-left sm:grid-cols-3"
        >
          <div className="space-y-4">
            <h4 className="text-muted-foreground/40 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
              <Activity className="h-3 w-3" /> Platform
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/patient/dashboard"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                Patient Portal
              </Link>
              <Link
                href="/clinician/dashboard"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                Clinician Panel
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-muted-foreground/40 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
              <Shield className="h-3 w-3" /> Support
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                Support Desk
              </Link>
              <Link
                href="/docs"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                API Documentation
              </Link>
            </div>
          </div>

          <div className="hidden space-y-4 sm:block">
            <h4 className="text-muted-foreground/40 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
              <Heart className="h-3 w-3" /> Legal
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/privacy"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-foreground/60 hover:text-primary text-sm font-medium transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute right-0 bottom-8 left-0 flex items-center justify-between px-8">
        <p className="text-muted-foreground/30 text-[10px] font-bold tracking-[0.2em] uppercase">
          &copy; 2026 CDSS PLATFORM • ADVANCED CLINICAL SUPPORT
        </p>

        {/* Small Logo at bottom right */}
        <div className="group flex cursor-default items-center gap-2 opacity-30 grayscale transition-all hover:grayscale-0">
          <div className="bg-primary group-hover:bg-primary/80 flex h-6 w-6 items-center justify-center rounded-full">
            <span className="text-[10px] font-black text-white">N</span>
          </div>
        </div>
      </div>
    </div>
  );
}
