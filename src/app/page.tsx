'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { mockProjects } from '@/lib/mock-data';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import ChatInput from '@/components/dashboard/ChatInput';
import QuickActionTabs from '@/components/dashboard/QuickActionTabs';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import AnnouncementModal from '@/components/modals/AnnouncementModal';

export default function Home() {
  const { sidebarOpen, rightPanelOpen, setTrendingProjects, setAnnouncementModalOpen } = useUIStore();

  useEffect(() => {
    setTrendingProjects(mockProjects);
    setTimeout(() => {
      setAnnouncementModalOpen(true);
    }, 1000);
  }, [setTrendingProjects, setAnnouncementModalOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className={cn(
          'flex-1 overflow-y-auto transition-all duration-200',
          sidebarOpen ? 'ml-[220px]' : 'ml-[44px]',
          rightPanelOpen ? 'mr-[360px]' : 'mr-0'
        )}>
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="space-y-4">
              <ChatInput />
            </div>
            
            <div className="space-y-4">
              <QuickActionTabs />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Trending Projects</h2>
              <ProjectGrid projects={mockProjects} />
            </div>
          </div>
        </main>
        <RightPanel />
      </div>
      <AnnouncementModal />
    </div>
  );
}
