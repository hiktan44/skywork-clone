'use client';

import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';

/** Navbar + sidebar + sign-in panel frame shared by dashboard pages. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, rightPanelOpen } = useUIStore();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-200',
            sidebarOpen ? 'ml-[220px]' : 'ml-[44px]',
            rightPanelOpen ? 'lg:mr-[360px]' : 'mr-0'
          )}
        >
          <div className="max-w-6xl mx-auto p-6 space-y-6">{children}</div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
