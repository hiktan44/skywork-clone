/**
 * Defence in depth for model-written HTML. The preview iframe is already sandboxed without
 * `allow-scripts`; this keeps the downloaded .html file script-free as well.
 *
 * The document is always rebuilt so the CSP <meta> is the very first thing in <head>; a CSP meta
 * that ends up in <body> (e.g. when a payload precedes the original <head>) is ignored by browsers.
 */
const CSP =
  "default-src 'none'; style-src 'unsafe-inline' https:; img-src https: data:; font-src https: data:; script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

const URL_ATTRS = /\b(href|src|action|formaction|xlink:href|poster|background|data|codebase|values|to|from)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

/** Decodes numeric/named entities and strips whitespace/control chars the way URL parsers do. */
function normalizeUrl(raw: string): string {
  return raw
    .replace(/^["']|["']$/g, '')
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&colon;/gi, ':')
    .replace(/&tab;|&newline;/gi, '')
    .replace(/[\u0000- \u007f-\u009f]/g, '')
    .toLowerCase();
}

function stripDangerous(html: string): string {
  return (
    html
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
      .replace(/<\/?script\b[^>]*>/gi, '')
      .replace(/<(iframe|object|embed|frame|frameset|applet|base|noscript|template)\b[\s\S]*?(<\/\1\s*>|\/?>)/gi, '')
      .replace(/<meta\b[^>]*http-equiv[^>]*>/gi, '')
      // Event handlers: preceded by whitespace, "/" (e.g. <svg/onload=…>) or a closing quote.
      .replace(/([\s/"'])on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '$1')
      .replace(URL_ATTRS, (match, name: string, value: string) =>
        /^(javascript|vbscript|livescript|data:text\/html|data:image\/svg)/.test(normalizeUrl(value))
          ? `${name}="#"`
          : match
      )
  );
}

export function sanitizeGeneratedHtml(input: string): string {
  const clean = stripDangerous(input);

  // Keep stylesheets and the title for <head>; everything else becomes body content.
  const styles = clean.match(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi) ?? [];
  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(clean)?.[1]?.replace(/<[^>]*>/g, '').trim() ?? '';
  const lang = /<html\b[^>]*\blang\s*=\s*["']?([a-zA-Z-]{2,10})/i.exec(clean)?.[1] ?? 'tr';
  const bodyMatch = /<body\b[^>]*>([\s\S]*?)(<\/body\s*>|$)/i.exec(clean);
  let body = bodyMatch ? bodyMatch[1] : clean;
  body = body
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?(html|head|body)\b[^>]*>/gi, '')
    .replace(/<(meta|link)\b[^>]*>/gi, (tag) => (/^<link\b/i.test(tag) && /rel\s*=\s*["']?stylesheet/i.test(tag) ? tag : ''));
  // The title is already HTML text (entities kept); tags were stripped, drop any stray brackets.
  const safeTitle = title.replace(/[<>]/g, '');

  return [
    '<!doctype html>',
    `<html lang="${lang}">`,
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    safeTitle ? `<title>${safeTitle}</title>` : '',
    ...styles,
    '</head>',
    `<body>${body.trim()}</body>`,
    '</html>',
  ]
    .filter(Boolean)
    .join('\n');
}
