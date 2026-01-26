'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Settings, HelpCircle, Shield, LogOut, User, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { signOut } from 'next-auth/react';
import { useUIStore } from '@/store';

export default function Sidebar({ links = [], secondaryLinks = [], className, user }) {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const defaultSecondaryLinks = [
    { href: '#', label: 'Settings', icon: Settings },
    { href: '#', label: 'Help & Center', icon: HelpCircle },
    { href: '#', label: 'Privacy', icon: Shield },
    { href: '#', label: 'Logout', icon: LogOut, action: true },
  ];

  const secondaryNavLinks =
    secondaryLinks.length > 0 ? secondaryLinks : defaultSecondaryLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card border-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Logo & Close Button */}
        <div className="border-border bg-background flex h-20 shrink-0 items-center justify-between border-b px-6">
          <Link href="/" className="relative h-23 w-28">
            <Image
              src="/logo.png"
              alt="CDSS Logo"
              fill
              priority
              className="object-contain object-left"
              sizes="(max-width: 768px) 100vw, 112px"
            />
          </Link>

          {/* Close Button (Mobile Only) */}
          <button
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="border-border my-6 border-t" />

          {/* Secondary Navigation Links */}
          <ul className="space-y-1">
            {secondaryNavLinks.map((link) => {
              const Icon = link.icon;

              return (
                <li key={link.label}>
                  {link.action ? (
                    <button
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      onClick={async () => {
                        setSidebarOpen(false);
                        // Clear all Zustand stores
                        try {
                          const { useAuthStore, useDiagnosisStore, useAssessmentStore } =
                            await import('@/store');

                          useAuthStore.getState().logout?.();
                          useDiagnosisStore.getState().reset?.();
                          useAssessmentStore.getState().resetAssessment?.();
                        } catch (err) {
                          console.error('Error clearing stores:', err);
                        }

                        // NextAuth SignOut
                        await signOut({
                          callbackUrl: '/',
                          redirect: true,
                        });
                      }}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{link.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="border-border border-t p-4">
          <Link
            href="#"
            className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-foreground truncate text-sm font-medium">
                {user ? `${user?.firstName} ${user?.lastName}` : 'Unknown User'}
              </span>
              <span className="text-[12px] font-medium capitalize opacity-70">
                {user ? `${user?.role.toLowerCase()}` : null}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
