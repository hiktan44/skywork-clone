'use client';

import Link from 'next/link';
import { Presentation, FileText, Image, Table, Globe, Video, Grid3x3 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { GenerationModule } from '@/lib/generation/schemas';

const quickActions: { id: string; labelKey: string; icon: React.ElementType; color: string; module: GenerationModule }[] = [
  { id: 'slides', labelKey: 'quickActions.slides', icon: Presentation, color: 'text-red-500', module: 'SLIDES' },
  { id: 'documents', labelKey: 'quickActions.documents', icon: FileText, color: 'text-blue-500', module: 'DOCUMENT' },
  { id: 'images', labelKey: 'quickActions.images', icon: Image, color: 'text-amber-500', module: 'IMAGE' },
  { id: 'sheets', labelKey: 'quickActions.sheets', icon: Table, color: 'text-green-500', module: 'SHEET' },
  { id: 'websites', labelKey: 'quickActions.websites', icon: Globe, color: 'text-violet-500', module: 'WEBSITE' },
  { id: 'videos', labelKey: 'quickActions.videos', icon: Video, color: 'text-pink-500', module: 'VIDEO' },
];

export default function QuickActionTabs() {
  const t = useT();
  const { selectedModule, setSelectedModule } = useUIStore();

  // Each quick action selects the matching generation tool for the chat box (click again to clear).
  const pick = (module: GenerationModule) => {
    setSelectedModule(selectedModule === module ? null : module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('chat-input')?.focus({ preventScroll: true });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {quickActions.map((action) => {
        const Icon = action.icon;
        const active = selectedModule === action.module;
        return (
          <button
            key={action.id}
            type="button"
            aria-pressed={active}
            onClick={() => pick(action.module)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-colors min-w-[80px] hover:bg-gray-100',
              active && 'bg-purple-50 ring-1 ring-purple-300'
            )}
          >
            <Icon className={`h-6 w-6 ${action.color}`} />
            <span className={`text-xs font-semibold ${action.color}`}>{t(action.labelKey)}</span>
          </button>
        );
      })}
      <Link
        href="/skills"
        className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors min-w-[80px]"
      >
        <Grid3x3 className="h-6 w-6 text-gray-500" />
        <span className="text-xs font-semibold text-gray-500">{t('quickActions.allSkills')}</span>
      </Link>
    </div>
  );
}
