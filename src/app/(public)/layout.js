import { TopNav } from '@/components/layout';

export default function PublicLayout({ children }) {
  return (
    <div className="bg-background relative min-h-screen">
      {/* Top Navigation for Public Pages */}
      <TopNav showSidebarTrigger={false} showUser={false} />

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-10">
        {children}
      </main>
    </div>
  );
}
