import { isAuthConfigured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// These products authenticate using cookies. Any cookie or Authorization header
// leaves the browser outside the anonymous sample. No identity value is read.
export function GET(request: Request) {
  const hasCredentials = request.headers.has('cookie') || request.headers.has('authorization');
  return new Response(null, {
    status: !isAuthConfigured() || hasCredentials ? 409 : 204,
    headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie, Authorization' },
  });
}
