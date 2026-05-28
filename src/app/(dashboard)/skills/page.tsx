'use client';

import { Sparkles, Tag } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { mockSkills } from '@/lib/mock-data';
import { ProjectType } from '@/lib/types';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const moduleColors: Record<ProjectType, string> = {
  [ProjectType.SLIDES]: 'bg-red-500',
  [ProjectType.DOCUMENT]: 'bg-blue-500',
  [ProjectType.IMAGE]: 'bg-amber-500',
  [ProjectType.SHEET]: 'bg-green-500',
  [ProjectType.WEBSITE]: 'bg-violet-500',
  [ProjectType.VIDEO]: 'bg-pink-500',
};

export default function SkillsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Skills</h1>
              <p className="text-gray-600">Hazır AI iş akışı şablonlarını keşfedin ve kullanın</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSkills.map((skill) => (
                <Card key={skill.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${moduleColors[skill.module]} flex items-center justify-center text-white`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {skill.module}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{skill.description}</p>

                  <div className="flex items-start gap-2 mb-4">
                    <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Şablonu Kullan
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}