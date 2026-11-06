'use client';

import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';

import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import ProjectGrid from '@/components/dashboard/ProjectGrid';

export default function ShowcasePage() {
  const { sidebarOpen, rightPanelOpen } = useUIStore();
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { projects?: Project[] }) => {
        if (cancelled) return;
        setProjects(data.projects ?? []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className={cn(
          'flex-1 overflow-y-auto transition-all duration-200',
          sidebarOpen ? 'ml-[220px]' : 'ml-[44px]',
          rightPanelOpen ? 'lg:mr-[360px]' : 'mr-0'
        )}>
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('showcase.title')}</h1>
              <p className="text-gray-600">{t('showcase.description')}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.trending')}</h2>
              {status === 'loading' ? (
                <p className="text-gray-500">{t('dashboard.loading')}</p>
              ) : status === 'error' ? (
                <p className="text-gray-500">{t('dashboard.loadError')}</p>
              ) : (
                <ProjectGrid projects={projects} />
              )}
            </div>
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}