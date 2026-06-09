import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

/**
 * Shared shell for public legal pages (/privacy, /terms).
 * Clinical-minimal: hairline header, eyebrow label, typographic prose body.
 */
export function LegalPage({ eyebrow, title, lastUpdated, children }) {
  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      {/* Header band */}
      <div className="border-border bg-muted/30 relative border-b">
        <div className="bg-primary/60 absolute inset-x-0 top-0 h-px" />
        <div className="mx-auto max-w-3xl px-6 pt-24 pb-12 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="text-muted-foreground mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <ShieldCheck className="text-primary h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <div className="prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary max-w-none">
          {children}
        </div>

        <div className="border-border mt-14 border-t pt-8">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/guide" className="hover:text-primary transition-colors">
              User Guide
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
