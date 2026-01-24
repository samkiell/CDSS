'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Settings, HelpCircle, Shield, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { signOut } from 'next-auth/react';

export default function Sidebar({ links = [], secondaryLinks = [], className, user }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      {/* Mobile Menu Button - Only visible when closed */}
      <button
        className={cn(
          'bg-primary text-primary-foreground fixed top-4 left-4 z-50 rounded-lg p-2 shadow-lg transition-opacity duration-200 lg:hidden',
          isMobileOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card border-border fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Logo & Close Button */}
        <div className="border-border bg-background flex h-24 shrink-0 items-center justify-between border-b px-6">
          <Link href="/" className="relative h-27 w-32">
            <Image
              src="/logo.png"
              alt="CDSS Logo"
              fill
              priority
              className="object-contain object-left"
              sizes="(max-width: 768px) 100vw, 128px"
            />
          </Link>

          {/* Close Button (Mobile Only) */}
          <button
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
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
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="border-border my-4 border-t" />

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
                        setIsMobileOpen(false);
                        await signOut({ redirectTo: '/' });
                      }}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      onClick={() => setIsMobileOpen(false)}
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
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                {user ? `${user?.firstName} ${user?.lastName}` : 'Unkonwn User'}
              </span>
              <span className="text-[12px] font-medium capitalize">
                {user ? `${user?.role.toLowerCase()}` : null}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
