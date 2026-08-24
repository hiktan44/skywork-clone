'use client';

import { ProjectType } from '@/lib/types';
import { Presentation, FileText, Image, Table, Globe, Video, Grid3x3 } from 'lucide-react';
import { useT } from '@/lib/i18n';

const quickActions = [
  { id: 'slides', labelKey: 'quickActions.slides', icon: Presentation, color: 'text-red-500', module: ProjectType.SLIDES },
  { id: 'documents', labelKey: 'quickActions.documents', icon: FileText, color: 'text-blue-500', module: ProjectType.DOCUMENT },
  { id: 'images', labelKey: 'quickActions.images', icon: Image, color: 'text-amber-500', module: ProjectType.IMAGE },
  { id: 'sheets', labelKey: 'quickActions.sheets', icon: Table, color: 'text-green-500', module: ProjectType.SHEET },
  { id: 'websites', labelKey: 'quickActions.websites', icon: Globe, color: 'text-violet-500', module: ProjectType.WEBSITE },
  { id: 'videos', labelKey: 'quickActions.videos', icon: Video, color: 'text-pink-500', module: ProjectType.VIDEO },
  { id: 'skills', labelKey: 'quickActions.allSkills', icon: Grid3x3, color: 'text-gray-500', module: ProjectType.DOCUMENT },
];

export default function QuickActionTabs() {
  const t = useT();

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
            <span className={`text-xs font-semibold ${action.color}`}>{t(action.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}