'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageViewer, SheetViewer, SlidesViewer, StoryboardViewer, WebsitePreview } from '@/components/projects/Viewers';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import type { ProjectContent } from '@/lib/generation/schemas';

interface LoadedProject {
  id: string;
  title: string;
  type: string;
  prompt: string;
  createdAt: string;
  content: ProjectContent | null;
}

// Download formats offered per module (served by /api/my-projects/[id]/download).
const DOWNLOADS: Record<ProjectContent['module'], { format: string; label: string }[]> = {
  SLIDES: [{ format: 'pptx', label: '.pptx' }],
  DOCUMENT: [
    { format: 'docx', label: '.docx' },
    { format: 'md', label: '.md' },
  ],
  SHEET: [{ format: 'xlsx', label: '.xlsx' }],
  WEBSITE: [{ format: 'html', label: '.html' }],
  VIDEO: [{ format: 'docx', label: '.docx' }],
  IMAGE: [{ format: 'image', label: 'PNG/JPG' }],
};

export default function ProjectDetailPage() {
  const t = useT();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { setRightPanelOpen } = useUIStore();
  const { data: session, isPending } = authClient.useSession();
  const [project, setProject] = useState<LoadedProject | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notFound' | 'signIn' | 'error'>('loading');
  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    fetch(`/api/my-projects/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return setStatus('signIn');
        if (res.status === 404) return setStatus('notFound');
        if (!res.ok) return setStatus('error');
        const data = (await res.json()) as { project: LoadedProject };
        if (cancelled) return;
        setProject(data.project);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, userId, isPending]);

  const remove = async () => {
    if (!project || !window.confirm(t('projects.deleteConfirm'))) return;
    const res = await fetch(`/api/my-projects/${encodeURIComponent(project.id)}`, { method: 'DELETE' });
    if (res.ok) router.push('/projects');
  };

  const content = project?.content ?? null;

  return (
    <AppShell>
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        {t('projects.back')}
      </Link>

      {status === 'loading' ? (
        <p className="text-gray-500">{t('dashboard.loading')}</p>
      ) : status === 'signIn' ? (
        <button
          type="button"
          onClick={() => setRightPanelOpen(true)}
          className="rounded-md bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          {t('projects.signIn')}
        </button>
      ) : status === 'notFound' ? (
        <p className="text-gray-500">{t('projects.notFound')}</p>
      ) : status === 'error' || !project ? (
        <p className="text-gray-500">{t('dashboard.loadError')}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <Badge variant="secondary">{t(`modules.${project.type}`)}</Badge>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-500">{project.prompt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {content &&
                DOWNLOADS[content.module].map((d) => (
                  <a
                    key={d.format}
                    href={`/api/my-projects/${encodeURIComponent(project.id)}/download?format=${d.format}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4" />
                    {t('projects.download')} {d.label}
                  </a>
                ))}
              <Button variant="outline" size="sm" className="h-9" onClick={remove} aria-label={t('projects.delete')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!content ? (
            <p className="text-gray-500">{t('projects.noContent')}</p>
          ) : content.module === 'SLIDES' ? (
            <SlidesViewer content={content} />
          ) : content.module === 'DOCUMENT' ? (
            <article className="rounded-xl border bg-white p-5 sm:p-8">
              <Markdown className="text-base">{content.markdown}</Markdown>
            </article>
          ) : content.module === 'SHEET' ? (
            <SheetViewer content={content} />
          ) : content.module === 'WEBSITE' ? (
            <WebsitePreview html={content.html} title={content.title} />
          ) : content.module === 'VIDEO' ? (
            <StoryboardViewer content={content} />
          ) : (
            <ImageViewer content={content} title={project.title} />
          )}
        </>
      )}
    </AppShell>
  );
}
