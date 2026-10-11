'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { useT } from '@/lib/i18n';

export default function RightPanel() {
  const { rightPanelOpen, setRightPanelOpen, setAuthModalOpen } = useUIStore();
  const t = useT();

  return (
    <aside
      className={cn(
        'fixed right-0 top-[52px] z-40 h-[calc(100vh-52px)] bg-white border-l shadow-lg transition-all duration-300',
        rightPanelOpen ? 'w-[360px]' : 'w-0 overflow-hidden'
      )}
    >
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('auth.signIn')}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Görevlerinizi görmek için Google hesabınızla giriş yapın.</p>
          <Button className="w-full" onClick={() => { setRightPanelOpen(false); setAuthModalOpen(true); }}>
            Giriş / Hesap
          </Button>
        </div>

        <div className="mt-auto pt-6 border-t">
          <div className="text-xs text-gray-500 space-y-2">
            <p>{t('auth.terms')}</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t('auth.notLoggedIn')}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}