import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

async function handle(request: Request) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
