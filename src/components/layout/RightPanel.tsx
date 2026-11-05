'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { authClient } from '@/lib/auth-client';

type SocialProvider = 'google' | 'github';

interface AuthConfig {
  enabled: boolean;
  emailPassword: boolean;
  socialProviders: SocialProvider[];
}

const providerMeta: Record<SocialProvider, { name: string; icon: string }> = {
  google: { name: 'Google', icon: '🔴' },
  github: { name: 'GitHub', icon: '🐙' },
};

export default function RightPanel() {
  const { rightPanelOpen, setRightPanelOpen } = useUIStore();
  const t = useT();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth-config')
      .then((res) => res.json())
      .then((data: AuthConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig({ enabled: false, emailPassword: false, socialProviders: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result =
      mode === 'signUp'
        ? await authClient.signUp.email({ name: name.trim() || email, email, password })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message || t('auth.genericError'));
      return;
    }
    setPassword('');
    setRightPanelOpen(false);
  };

  const handleSocial = async (provider: SocialProvider) => {
    setError(null);
    const result = await authClient.signIn.social({ provider, callbackURL: '/' });
    if (result?.error) setError(result.error.message || t('auth.genericError'));
  };

  const handleSignOut = async () => {
    setBusy(true);
    await authClient.signOut();
    setBusy(false);
  };

  const user = session?.user;

  return (
    <aside
      className={cn(
        'fixed right-0 top-[52px] z-40 h-[calc(100vh-52px)] bg-white border-l shadow-lg transition-all duration-300',
        rightPanelOpen ? 'w-[360px] max-w-full' : 'w-0 overflow-hidden'
      )}
    >
      <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{user ? t('auth.account') : t('auth.signIn')}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {sessionPending || !config ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : user ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-gray-500">{t('auth.signedInAs')}</p>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <Button variant="outline" className="w-full h-11" onClick={handleSignOut} disabled={busy}>
              {t('auth.signOut')}
            </Button>
          </div>
        ) : !config.enabled ? (
          <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t('auth.notConfigured')}
          </p>
        ) : (
          <div className="space-y-4">
            {config.socialProviders.length > 0 && (
              <div className="space-y-3">
                {config.socialProviders.map((provider) => (
                  <Button
                    key={provider}
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleSocial(provider)}
                  >
                    <span className="text-lg">{providerMeta[provider].icon}</span>
                    <span>{t('auth.continueWith', { provider: providerMeta[provider].name })}</span>
                  </Button>
                ))}
                <p className="text-center text-xs text-gray-400">{t('auth.or')}</p>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === 'signUp' && (
                <Input
                  placeholder={t('auth.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              )}
              <Input
                type="email"
                required
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                type="password"
                required
                minLength={8}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
              />
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full h-11 bg-black text-white hover:bg-gray-800" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signUp' ? t('auth.signUpAction') : t('auth.signInAction')}
              </Button>
            </form>

            <button
              type="button"
              className="w-full text-center text-sm text-purple-700 hover:underline"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError(null);
              }}
            >
              {mode === 'signIn' ? t('auth.toSignUp') : t('auth.toSignIn')}
            </button>
          </div>
        )}

        <div className="mt-auto pt-6 border-t">
          <div className="text-xs text-gray-500 space-y-2">
            <p>{t('auth.terms')}</p>
            {!user && <p className="text-gray-400">{t('auth.notLoggedIn')}</p>}
          </div>
        </div>
      </div>
    </aside>
  );
}
