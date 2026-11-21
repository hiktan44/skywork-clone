import { cookies, headers } from 'next/headers';

export type ServerLang = 'tr' | 'en';

/**
 * Best-effort language for server-rendered metadata (the visible UI is resolved in the browser by
 * use-lang.ts): the `ui_lang` cookie the client mirrors, else the Accept-Language header
 * (Turkish -> tr, anything else -> en), else Turkish.
 */
export async function getServerLang(): Promise<ServerLang> {
  const cookie = (await cookies()).get('ui_lang')?.value;
  if (cookie === 'tr' || cookie === 'en') return cookie;
  const primary = ((await headers()).get('accept-language') ?? '').split(',')[0]?.trim().toLowerCase();
  if (primary) return primary.startsWith('tr') ? 'tr' : 'en';
  return 'tr';
}
