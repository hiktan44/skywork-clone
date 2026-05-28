'use client';

import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { mockProjects } from '@/lib/mock-data';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import ProjectGrid from '@/components/dashboard/ProjectGrid';

export default function ShowcasePage() {
  const { sidebarOpen, rightPanelOpen } = useUIStore();

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Showcase</h1>
              <p className="text-gray-600">Topluluk tarafından oluşturulan en iyi projeler</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Trending Projects</h2>
              <ProjectGrid projects={mockProjects} />
            </div>
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}