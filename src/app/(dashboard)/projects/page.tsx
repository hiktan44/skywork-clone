'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useT } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { coverFor } from '@/lib/covers';

interface MyProject {
  id: string;
  title: string;
  type: string;
  prompt: string;
  createdAt: string;
}

export default function MyProjectsPage() {
  const t = useT();
  const { setRightPanelOpen } = useUIStore();
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    fetch('/api/my-projects', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { projects?: MyProject[] }) => {
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
  }, [userId, isPending]);

  return (
    <AppShell>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('projects.title')}</h1>
        <p className="text-gray-600">{t('projects.description')}</p>
      </div>

      {status === 'loading' || isPending ? (
        <p className="text-gray-500">{t('dashboard.loading')}</p>
      ) : status === 'error' ? (
        <p className="text-gray-500">{t('dashboard.loadError')}</p>
      ) : !userId ? (
        <button
          type="button"
          onClick={() => setRightPanelOpen(true)}
          className="rounded-md bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          {t('projects.signIn')}
        </button>
      ) : projects.length === 0 ? (
        <p className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {t('projects.empty')}{' '}
          <Link href="/" className="font-medium text-purple-700 underline">
            {t('nav.home')}
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${encodeURIComponent(p.id)}`}
              className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[10/7] w-full overflow-hidden">
                <Image src={coverFor({ id: p.id, type: p.type })} alt="" fill sizes="25vw" className="object-cover" />
              </div>
              <div className="space-y-1 p-3">
                <h3 className="truncate text-xs font-semibold text-gray-900">{p.title}</h3>
                <p className="line-clamp-2 text-[11px] text-gray-500">{p.prompt}</p>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  {t(`modules.${p.type}`)} · {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
