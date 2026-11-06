import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { SheetContent, SlidesContent, StoryboardContent } from '@/lib/generation/schemas';

const ACCENT = '7C3AED';

export async function buildPptx(content: SlidesContent): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = content.title;

  const cover = pptx.addSlide();
  cover.background = { color: 'F5F3FF' };
  cover.addText(content.title, { x: 0.7, y: 2.4, w: 12, h: 1.2, fontSize: 40, bold: true, color: '1F2937' });
  if (content.subtitle) {
    cover.addText(content.subtitle, { x: 0.7, y: 3.6, w: 12, h: 0.8, fontSize: 20, color: '6B7280' });
  }
  cover.addShape(pptx.ShapeType.rect, { x: 0.7, y: 2.2, w: 1.2, h: 0.08, fill: { color: ACCENT } });

  content.slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: ACCENT } });
    slide.addText(s.title, { x: 0.6, y: 0.4, w: 12, h: 0.9, fontSize: 28, bold: true, color: '111827' });
    slide.addText(
      s.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
      { x: 0.8, y: 1.5, w: 11.8, h: 5.2, fontSize: 18, color: '374151', valign: 'top', paraSpaceAfter: 10 }
    );
    slide.addText(`${i + 2}`, { x: 12.3, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: '9CA3AF', align: 'right' });
    if (s.notes) slide.addNotes(s.notes);
  });

  const out = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(out as ArrayBuffer);
}

// ---------- Markdown → DOCX (headings, paragraphs, lists, tables, bold/italic/code) ----------

function inlineRuns(text: string, base: { bold?: boolean } = {}): TextRun[] {
  const runs: TextRun[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith('**') || tok.startsWith('__')) runs.push(new TextRun({ text: tok.slice(2, -2), bold: true }));
    else if (tok.startsWith('`')) runs.push(new TextRun({ text: tok.slice(1, -1), font: 'Consolas', ...base }));
    else runs.push(new TextRun({ text: tok.slice(1, -1), italics: true, ...base }));
    last = m.index! + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...base }));
  return runs.length ? runs : [new TextRun({ text: '', ...base })];
}

const splitRow = (line: string) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

function makeTable(rows: string[][]): Table {
  const width = Math.max(...rows.map((r) => r.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r, ri) =>
        new TableRow({
          tableHeader: ri === 0,
          children: Array.from({ length: width }, (_, ci) =>
            new TableCell({ children: [new Paragraph({ children: inlineRuns(r[ci] ?? '', { bold: ri === 0 }) })] })
          ),
        })
    ),
  });
}

const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];

export function markdownToDocxBlocks(markdown: string): (Paragraph | Table)[] {
  const blocks: (Paragraph | Table)[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push(new Paragraph({ children: inlineRuns(para.join(' ')), spacing: { after: 160 } }));
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      blocks.push(new Paragraph({ heading: HEADINGS[heading[1].length - 1], children: inlineRuns(heading[2]) }));
      continue;
    }
    if (trimmed.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        if (!/^\|?\s*:?-{2,}/.test(lines[i].trim())) rows.push(splitRow(lines[i]));
        i++;
      }
      i--;
      if (rows.length) blocks.push(makeTable(rows), new Paragraph({ text: '' }));
      continue;
    }
    const bullet = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flush();
      blocks.push(new Paragraph({ bullet: { level: line.startsWith('  ') ? 1 : 0 }, children: inlineRuns(bullet[1]) }));
      continue;
    }
    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flush();
      blocks.push(new Paragraph({ children: [new TextRun({ text: `${numbered[1]}. ` }), ...inlineRuns(numbered[2])] }));
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flush();
      continue;
    }
    para.push(trimmed.replace(/^>\s?/, ''));
  }
  flush();
  return blocks;
}

async function packDocx(title: string, children: (Paragraph | Table)[]): Promise<Buffer> {
  const doc = new Document({
    creator: 'Skywork',
    title,
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}

export async function buildDocx(title: string, markdown: string): Promise<Buffer> {
  const blocks = markdownToDocxBlocks(markdown);
  const startsWithTitle = /^\s*#\s+/.test(markdown);
  const children = startsWithTitle
    ? blocks
    : [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] }), ...blocks];
  return packDocx(title, children);
}

export async function buildStoryboardDocx(content: StoryboardContent): Promise<Buffer> {
  const header = ['Zaman', 'Görüntü', 'Seslendirme', 'Ekran yazısı'];
  const rows = [header, ...content.scenes.map((s) => [s.time, s.visual, s.voiceover, s.onScreenText])];
  return packDocx(content.title, [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(content.title)] }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `Storyboard · ${content.durationSec} sn · video dosyası değildir`, italics: true })],
    }),
    new Paragraph({ children: inlineRuns(content.summary), spacing: { after: 200 } }),
    makeTable(rows),
  ]);
}

export async function buildXlsx(content: SheetContent): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Skywork';
  const ws = wb.addWorksheet(content.title.slice(0, 31).replace(/[\\/?*[\]:]/g, ' ') || 'Tablo');
  ws.addRow(content.columns);
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${ACCENT}` } };
  for (const row of content.rows) ws.addRow(row);
  ws.columns.forEach((col, i) => {
    const longest = Math.max(
      String(content.columns[i] ?? '').length,
      ...content.rows.map((r) => String(r[i] ?? '').length)
    );
    col.width = Math.min(60, Math.max(10, longest + 2));
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  if (content.notes) {
    ws.addRow([]);
    ws.addRow([content.notes]).font = { italic: true, color: { argb: 'FF6B7280' } };
  }
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}
