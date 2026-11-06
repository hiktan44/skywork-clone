'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { Presentation, FileText, Image as ImageIcon, Table, Globe, Video, Folder } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { coverFor } from '@/lib/covers';

interface ProjectGridProps {
  projects: Project[];
}

const iconMap: Record<string, React.ElementType> = {
  SLIDES: Presentation,
  DOCUMENT: FileText,
  IMAGE: ImageIcon,
  SHEET: Table,
  WEBSITE: Globe,
  VIDEO: Video,
};

const moduleColor: Record<string, string> = {
  SLIDES: 'bg-red-500',
  DOCUMENT: 'bg-blue-500',
  IMAGE: 'bg-amber-500',
  SHEET: 'bg-green-500',
  WEBSITE: 'bg-violet-500',
  VIDEO: 'bg-pink-500',
};

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { setChatDraft } = useUIStore();

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">{t('dashboard.noProjects')}</p>
      </div>
    );
  }

  // Clicking a card reuses its prompt in the chat box on the home page.
  const applyPrompt = (prompt: string) => {
    setChatDraft(prompt);
    if (pathname !== '/') {
      router.push('/');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('chat-input')?.focus({ preventScroll: true });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {projects.map((project, index) => {
        const Icon = iconMap[project.type] || Folder;
        return (
          <button
            key={project.id}
            type="button"
            onClick={() => applyPrompt(project.prompt)}
            title={`${t('dashboard.useAsPrompt')}: ${project.prompt}`}
            className="group overflow-hidden rounded-xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            <div className="relative aspect-[10/7] w-full overflow-hidden">
              <Image
                src={coverFor(project)}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                priority={index < 4}
                className="object-cover transition-transform group-hover:scale-[1.03]"
              />
              <div
                className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white ${moduleColor[project.type] || 'bg-gray-500'}`}
              >
                <Icon className="h-3 w-3" />
              </div>
            </div>
            <div className="space-y-1 p-3">
              <h3 className="truncate text-xs font-semibold text-gray-900">{project.title}</h3>
              <p className="line-clamp-2 text-[11px] leading-snug text-gray-500">{project.prompt}</p>
              <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {t(`modules.${project.type}`)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
