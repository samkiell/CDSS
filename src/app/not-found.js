import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui';

export const metadata = {
  title: '404 - Page Not Found | CDSS',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="bg-primary/5 absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
      </div>

      <div className="animate-fade-in relative z-10 flex max-w-2xl flex-col items-center">
        {/* Error Code */}
        <div className="relative mb-8">
          <h1 className="text-foreground/5 text-[12rem] leading-none font-black tracking-tighter sm:text-[18rem]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 animate-pulse rounded-full p-8">
              <Search className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-foreground mb-4 text-3xl font-black tracking-tight sm:text-4xl">
          Lost in the System?
        </h2>
        <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
          The diagnosis is in: the page you're searching for seems to have vanished or
          moved to a different observation room.
        </p>

        {/* Actions */}
        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="shadow-primary/20 h-14 w-full gap-2 rounded-2xl px-8 text-base shadow-lg sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/help" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="h-14 w-full gap-2 rounded-2xl px-8 text-base sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Help Center
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="border-border mt-16 grid w-full grid-cols-2 gap-8 border-t pt-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
              Platform
            </span>
            <Link
              href="/patient/dashboard"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              Patient Portal
            </Link>
            <Link
              href="/clinician/dashboard"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              Clinician Panel
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
              Support
            </span>
            <Link
              href="/contact"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              Support Desk
            </Link>
            <Link
              href="/docs"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              API Docs
            </Link>
          </div>
          <div className="hidden flex-col gap-2 sm:flex">
            <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
              Legal
            </span>
            <Link
              href="/privacy"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary text-sm font-bold transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="text-muted-foreground/40 absolute bottom-8 text-[10px] font-bold tracking-[0.2em] uppercase">
        &copy; 2026 CDSS PLATFORM • ADVANCED CLINICAL SUPPORT
      </p>
    </div>
  );
}
