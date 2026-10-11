import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { googleUser } from './task-store';

export function verifiedGoogleEmail(provider: string | undefined, profile: Record<string, unknown> | undefined) {
  if (provider !== 'google' || profile?.email_verified !== true) return null;
  const email = profile.email;
  return typeof email === 'string' && email.trim() === email && /^[^\s@]+@[^\s@]+$/.test(email)
    ? email.toLowerCase() : null;
}

export function taskAuthConfig(): NextAuthConfig {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret.trim()) < 32) {
    throw new Error('AUTH_SECRET en az 32 baytlık harici bir anahtar olmalıdır.');
  }
  const configured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return {
    secret,
    providers: configured ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : [],
    session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
    callbacks: {
      async signIn({ account, profile }) {
        return Boolean(verifiedGoogleEmail(account?.provider, profile));
      },
      async jwt({ token, account, profile, user }) {
        if (account) {
          const email = verifiedGoogleEmail(account.provider, profile);
          if (!email) return null;
          const owner = await googleUser(email, user.name, user.image);
          token.uid = owner.id;
          token.email = owner.email;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && typeof token.uid === 'string') session.user.id = token.uid;
        return session;
      },
    },
  };
}
