'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function FloatingIssue({ count = 1 }) {
  const [show, setShow] = useState(true);

  if (!show || count === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 animate-bounce">
      <div className="bg-destructive text-destructive-foreground flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 shadow-2xl">
        <div className="rounded-full bg-white/20 p-1">
          <AlertCircle className="h-4 w-4" />
        </div>
        <span className="text-sm font-black whitespace-nowrap">
          {count} Critical Case{count > 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShow(false)}
          className="rounded-full p-0.5 transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
