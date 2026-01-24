'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui';

function Sidebar({ links = [], className }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="bg-sidebar text-sidebar-foreground fixed top-4 left-4 z-50 rounded-lg p-2 shadow-lg lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          'bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Logo */}
        <div className="border-sidebar-muted flex h-16 items-center justify-center border-b px-4">
          <Logo
            size="sm"
            showText
            className="text-sidebar-foreground [&_span]:text-sidebar-foreground [&_svg]:text-sidebar-foreground"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {links.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-muted text-sidebar-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-muted/50 hover:text-sidebar-foreground'
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
        </nav>

        {/* Footer */}
        <div className="border-sidebar-muted border-t p-4">
          <p className="text-sidebar-foreground/60 text-xs">© 2026 CDSS Platform</p>
        </div>
      </aside>
    </>
  );
}

export { Sidebar };
