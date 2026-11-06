const COVER_TYPES = ['slides', 'document', 'image', 'sheet', 'website', 'video'] as const;

/**
 * Only local covers from /public/covers are trusted; anything else (or a missing
 * thumbnail on older rows) falls back to a deterministic cover for the project type.
 */
export function coverFor(project: { id: string; type: string; thumbnailUrl?: string | null }): string {
  const url = project.thumbnailUrl;
  if (url && /^\/covers\/[a-z]+-\d\.svg$/.test(url)) return url;
  const type = project.type.toLowerCase();
  const safeType = (COVER_TYPES as readonly string[]).includes(type) ? type : 'document';
  let hash = 0;
  for (const ch of project.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `/covers/${safeType}-${(hash % 2) + 1}.svg`;
}
