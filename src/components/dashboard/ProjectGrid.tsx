'use client';

import { useMemo } from 'react';
import { Project } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Presentation, FileText, Image, Table, Globe, Video, Folder } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
}

const iconMap: Record<string, React.ElementType> = {
  SLIDES: Presentation,
  DOCUMENT: FileText,
  IMAGE: Image,
  SHEET: Table,
  WEBSITE: Globe,
  VIDEO: Video,
};

const moduleGradients: Record<string, string> = {
  SLIDES: 'from-red-100 to-orange-100',
  DOCUMENT: 'from-blue-100 to-cyan-100',
  IMAGE: 'from-amber-100 to-yellow-100',
  SHEET: 'from-green-100 to-emerald-100',
  WEBSITE: 'from-violet-100 to-purple-100',
  VIDEO: 'from-pink-100 to-rose-100',
};

const heights = [100, 140, 120, 180, 110, 160, 130, 150];

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const getModuleColor = (type: string) => {
    switch (type) {
      case 'SLIDES': return 'bg-red-500';
      case 'DOCUMENT': return 'bg-blue-500';
      case 'IMAGE': return 'bg-amber-500';
      case 'SHEET': return 'bg-green-500';
      case 'WEBSITE': return 'bg-violet-500';
      case 'VIDEO': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">Henüz proje yok</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {projects.map((project, index) => {
        const Icon = iconMap[project.type] || Folder;
        const gradient = moduleGradients[project.type] || 'from-gray-100 to-gray-200';
        return (
          <Card
            key={project.id}
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{
              minHeight: `${heights[index % heights.length]}px`,
            }}
          >
            <div className="relative h-full">
              <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
              
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-xs font-semibold text-white truncate">
                  {project.title}
                </h3>
              </div>

              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full ${getModuleColor(project.type)} flex items-center justify-center text-white`}>
                <Icon className="h-3 w-3" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}