import { betterAuth } from 'better-auth';
import { getPool } from '@/lib/pool';

export type SocialProviderId = 'google' | 'github';

function socialProviders() {
  const providers: {
    google?: { clientId: string; clientSecret: string; prompt: 'select_account' };
    github?: { clientId: string; clientSecret: string };
  } = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Default Google scopes are openid + email + profile.
    // Callback: <BETTER_AUTH_URL>/api/auth/callback/google
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      prompt: 'select_account',
    };
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }
  return providers;
}

/** Auth only works with a real secret and database; otherwise the app stays usable without it. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL);
}

export function enabledSocialProviders(): SocialProviderId[] {
  return Object.keys(socialProviders()) as SocialProviderId[];
}

function createAuth() {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL is required for authentication');
  // BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment by Better Auth.
  return betterAuth({
    appName: 'Skywork',
    database: pool,
    // Tables are created by script/migrate.mjs; Better Auth reuses the existing "User" table.
    user: { modelName: 'User' },
    session: { modelName: 'Session' },
    account: {
      modelName: 'Account',
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
        // Never attach a social login to an email/password account whose mailbox was not proven
        // (prevents pre-registration account takeover). Explicit even though it is the default.
        requireLocalEmailVerified: true,
      },
    },
    verification: { modelName: 'Verification' },
    emailAndPassword: { enabled: true },
    socialProviders: socialProviders(),
    advanced: {
      // Behind the Coolify/Traefik proxy; needed for per-IP rate limiting.
      ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
    },
  });
}

type Auth = ReturnType<typeof createAuth>;
let authInstance: Auth | null = null;

/** Lazily created so `next build` and unconfigured deployments never throw on a missing secret. */
export function getAuth(): Auth | null {
  if (!isAuthConfigured()) return null;
  authInstance ??= createAuth();
  return authInstance;
}

export type SessionUser = { id: string; name: string; email: string };

/** Resolves the signed-in user from request cookies, or null. */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const auth = getAuth();
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}
