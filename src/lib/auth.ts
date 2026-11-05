import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export type SocialProviderId = 'google' | 'github';

function socialProviders() {
  const providers: Partial<Record<SocialProviderId, { clientId: string; clientSecret: string }>> = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }),
    // Tables are created by script/migrate.mjs; Better Auth reuses the existing "User" table.
    user: { modelName: 'User' },
    session: { modelName: 'Session' },
    account: { modelName: 'Account' },
    verification: { modelName: 'Verification' },
    emailAndPassword: { enabled: true },
    socialProviders: socialProviders(),
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
