'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function OfflineStatus() {
  const [status, setStatus] = useState('online'); // 'online' | 'offline' | 'restoring'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setStatus('restoring');
      // Show "Back online" for 3 seconds before hiding
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setStatus('online'), 500); // Reset after fade out
      }, 3000);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setStatus('offline');
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible && status === 'online') return null;

  const isOffline = status === 'offline';
  const isRestoring = status === 'restoring';

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-[100] w-[90%] max-w-md -translate-x-1/2 transform transition-all duration-500 ease-out sm:w-auto',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      )}
    >
      <div
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:w-auto',
          isOffline
            ? 'bg-destructive/10 border-destructive/20 text-destructive shadow-destructive/10'
            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10 dark:text-emerald-400'
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300',
            isOffline ? 'bg-destructive/20' : 'bg-emerald-500/20'
          )}
        >
          {isOffline ? (
            <WifiOff className="h-4 w-4 animate-pulse" />
          ) : (
            <Wifi className="h-4 w-4 animate-bounce" />
          )}
        </div>
        <div className="flex flex-col pr-1">
          <p className="text-[13px] leading-none font-bold tracking-tight">
            {isOffline ? "You're currently offline" : 'Connection Restored'}
          </p>
          <p className="mt-1 text-[11px] leading-none font-medium opacity-70">
            {isOffline ? 'Some features may not be available.' : 'You are back online.'}
          </p>
        </div>
        {isOffline && (
          <div className="ml-2 flex gap-1">
            <span className="bg-destructive h-1.5 w-1.5 animate-ping rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
