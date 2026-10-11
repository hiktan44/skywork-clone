import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handlers } from '@/auth';

export const runtime = 'nodejs';

async function handle(request: NextRequest, method: 'GET' | 'POST') {
  try { return await handlers[method](request); }
  catch {
    return NextResponse.json({ error: 'Giriş hizmeti yapılandırılmamış veya kullanılamıyor.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
export async function GET(request: NextRequest) { return handle(request, 'GET'); }
export async function POST(request: NextRequest) { return handle(request, 'POST'); }
