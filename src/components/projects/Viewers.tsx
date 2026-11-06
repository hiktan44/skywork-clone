'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Markdown from '@/components/Markdown';
import { useT } from '@/lib/i18n';
import type {
  ImageContent,
  SheetContent,
  SlidesContent,
  StoryboardContent,
} from '@/lib/generation/schemas';

export function SlidesViewer({ content }: { content: SlidesContent }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const total = content.slides.length + 1;
  const slide = index === 0 ? null : content.slides[index - 1];

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-purple-600" />
        {slide ? (
          <div className="flex h-full flex-col p-[5%]">
            <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">{slide.title}</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs text-gray-700 sm:mt-5 sm:space-y-3 sm:text-base">
              {slide.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center bg-purple-50 p-[6%]">
            <div className="mb-3 h-1 w-16 bg-purple-600" />
            <h2 className="text-xl font-bold text-gray-900 sm:text-4xl">{content.title}</h2>
            {content.subtitle && <p className="mt-2 text-sm text-gray-600 sm:text-xl">{content.subtitle}</p>}
          </div>
        )}
        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t('projects.prev')}
        </Button>
        <span className="text-xs text-gray-500">
          {t('projects.slide')} {index + 1} / {total}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
        >
          {t('projects.next')}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {slide?.notes && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('projects.notes')}</p>
          {slide.notes}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[content.title, ...content.slides.map((s) => s.title)].map((title, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`min-w-[120px] max-w-[160px] rounded-md border px-2 py-1.5 text-left text-[11px] ${
              i === index ? 'border-purple-500 bg-purple-50 text-purple-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="block text-gray-400">{i + 1}</span>
            <span className="line-clamp-2">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SheetViewer({ content }: { content: SheetContent }) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-purple-600 text-white">
              {content.columns.map((c, i) => (
                <th key={i} className="px-3 py-2 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-gray-50">
                {content.columns.map((_, ci) => (
                  <td
                    key={ci}
                    className={`border-t px-3 py-1.5 ${typeof row[ci] === 'number' ? 'text-right tabular-nums' : ''}`}
                  >
                    {typeof row[ci] === 'number' ? (row[ci] as number).toLocaleString('tr-TR') : (row[ci] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {content.notes && <p className="text-xs italic text-gray-500">{content.notes}</p>}
    </div>
  );
}

export function WebsitePreview({ html, title }: { html: string; title: string }) {
  const t = useT();
  return (
    <div className="space-y-2">
      {/* Empty sandbox: no scripts, forms, popups or top navigation. */}
      <iframe
        title={title}
        sandbox=""
        srcDoc={html}
        referrerPolicy="no-referrer"
        className="h-[70vh] min-h-[420px] w-full rounded-lg border bg-white"
      />
      <p className="text-xs text-gray-500">{t('projects.websiteNote')}</p>
    </div>
  );
}

export function StoryboardViewer({ content }: { content: StoryboardContent }) {
  const t = useT();
  return (
    <div className="space-y-3">
      <p role="note" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        {t('projects.storyboardNotice')} · {content.durationSec} sn
      </p>
      {content.summary && <Markdown>{content.summary}</Markdown>}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['sceneTime', 'sceneVisual', 'sceneVoice', 'sceneText'].map((k) => (
                <th key={k} className="px-3 py-2 font-semibold">
                  {t(`projects.${k}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.scenes.map((s, i) => (
              <tr key={i} className="border-t align-top">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{s.time}</td>
                <td className="px-3 py-2">{s.visual}</td>
                <td className="px-3 py-2">{s.voiceover}</td>
                <td className="px-3 py-2 font-medium">{s.onScreenText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ImageViewer({ content, title }: { content: ImageContent; title: string }) {
  return (
    <figure className="space-y-2">
      <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-xl border bg-gray-50">
        <Image
          src={`data:${content.mediaType};base64,${content.base64}`}
          alt={title}
          fill
          unoptimized
          className="object-contain"
        />
      </div>
      {content.caption && <figcaption className="text-center text-sm text-gray-500">{content.caption}</figcaption>}
    </figure>
  );
}
