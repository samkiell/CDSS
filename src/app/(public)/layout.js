import { ThemeToggle } from '@/components/ui';

export default function PublicLayout({ children }) {
  return (
    <div className="bg-background relative min-h-screen">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
