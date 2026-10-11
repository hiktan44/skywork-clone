'use client';

import { useEffect, useState } from 'react';
import { getProviders, getSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore } from '@/lib/store';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useUIStore();
  const [session, setSession] = useState<Session | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authModalOpen) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [providers, current] = await Promise.all([getProviders(), getSession()]);
        if (!cancelled) {
          setSession(current);
          setGoogleAvailable(Boolean(providers?.google));
          if (!current && !providers?.google) setError('Google girişi şu anda kullanılamıyor. Daha sonra tekrar deneyin.');
        }
      } catch {
        if (!cancelled) setError('Giriş hizmetine ulaşılamadı. Lütfen yeniden deneyin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [authModalOpen]);

  async function login() {
    setBusy(true);
    setError('');
    try { await signIn('google', { redirectTo: '/scheduled' }); }
    catch { setError('Google girişi başlatılamadı. Lütfen yeniden deneyin.'); setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try { await signOut({ redirectTo: '/scheduled' }); }
    catch { setError('Çıkış tamamlanamadı. Lütfen yeniden deneyin.'); setBusy(false); }
  }

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{session ? 'Hesabınız' : 'Giriş yap'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {loading ? <p>Oturum kontrol ediliyor…</p> : session ? (
            <><p>{session.user.email}</p><Button disabled={busy} onClick={logout}>Çıkış yap</Button></>
          ) : (
            <><p>Görevlerinizi görmek için Google hesabınızla giriş yapın.</p>
              <Button className="w-full" disabled={!googleAvailable || busy} onClick={login}>
                {busy ? 'Yönlendiriliyor…' : 'Google ile devam et'}
              </Button></>
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
