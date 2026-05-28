'use client';

import { ProjectType } from '@/lib/types';
import { Presentation, FileText, Image, Table, Globe, Video, Grid3x3 } from 'lucide-react';

const quickActions = [
  { id: 'slides', label: 'Slides', icon: Presentation, color: 'text-red-500', module: ProjectType.SLIDES },
  { id: 'documents', label: 'Documents', icon: FileText, color: 'text-blue-500', module: ProjectType.DOCUMENT },
  { id: 'images', label: 'Images', icon: Image, color: 'text-amber-500', module: ProjectType.IMAGE },
  { id: 'sheets', label: 'Sheets', icon: Table, color: 'text-green-500', module: ProjectType.SHEET },
  { id: 'websites', label: 'Websites', icon: Globe, color: 'text-violet-500', module: ProjectType.WEBSITE },
  { id: 'videos', label: 'Videos', icon: Video, color: 'text-pink-500', module: ProjectType.VIDEO },
  { id: 'skills', label: 'All Skills', icon: Grid3x3, color: 'text-gray-500', module: ProjectType.DOCUMENT },
];

export default function QuickActionTabs() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px]"
          >
            <Icon className={`h-6 w-6 ${action.color}`} />
            <span className={`text-xs font-semibold ${action.color}`}>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}