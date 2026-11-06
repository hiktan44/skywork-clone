import { NextResponse } from 'next/server';
import { loadOwnedProject } from '@/lib/my-projects';
import { buildDocx, buildPptx, buildStoryboardDocx, buildXlsx } from '@/lib/generation/export';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const MIME = {
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  html: 'text/html; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
} as const;

function safeName(title: string) {
  const ascii = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return ascii || 'skywork';
}

function fileResponse(body: Buffer | string, type: string, filename: string, utf8Name: string) {
  return new NextResponse(new Uint8Array(typeof body === 'string' ? Buffer.from(body, 'utf8') : body), {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const result = await loadOwnedProject(request, id);
  if ('status' in result) return NextResponse.json({ error: 'not_available' }, { status: result.status });
  const { project } = result;
  const content = project.content;
  if (!content) return NextResponse.json({ error: 'no_content' }, { status: 404 });

  const format = new URL(request.url).searchParams.get('format');
  const base = safeName(project.title);
  const name = (ext: string) => [`${base}.${ext}`, `${project.title}.${ext}`] as const;

  switch (content.module) {
    case 'SLIDES':
      if (format === 'pptx') return fileResponse(await buildPptx(content), MIME.pptx, ...name('pptx'));
      break;
    case 'DOCUMENT':
      if (format === 'docx') return fileResponse(await buildDocx(content.title, content.markdown), MIME.docx, ...name('docx'));
      if (format === 'md') return fileResponse(content.markdown, MIME.md, ...name('md'));
      break;
    case 'SHEET':
      if (format === 'xlsx') return fileResponse(await buildXlsx(content), MIME.xlsx, ...name('xlsx'));
      break;
    case 'WEBSITE':
      // Already sanitized (no scripts, CSP meta) when it was generated and re-validated on load.
      if (format === 'html') return fileResponse(content.html, MIME.html, ...name('html'));
      break;
    case 'VIDEO':
      if (format === 'docx') return fileResponse(await buildStoryboardDocx(content), MIME.docx, ...name('docx'));
      break;
    case 'IMAGE':
      if (format === 'image') {
        const ext = content.mediaType.split('/')[1] === 'jpeg' ? 'jpg' : content.mediaType.split('/')[1];
        return fileResponse(Buffer.from(content.base64, 'base64'), content.mediaType, ...name(ext));
      }
      break;
  }
  return NextResponse.json({ error: 'unsupported_format' }, { status: 400 });
}
