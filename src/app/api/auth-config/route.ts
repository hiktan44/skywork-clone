import { NextResponse } from 'next/server';
import { enabledSocialProviders, isAuthConfigured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Tells the client whether sign-in works and which social providers are configured. */
export async function GET() {
  const enabled = isAuthConfigured();
  return NextResponse.json({
    enabled,
    emailPassword: enabled,
    socialProviders: enabled ? enabledSocialProviders() : [],
  });
}
