'use client';

import { Monitor, Tablet, Menu, LogIn, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import LangSwitch from '@/components/LangSwitch';
import { authClient } from '@/lib/auth-client';

export default function Navbar() {
  const { toggleSidebar, setRightPanelOpen } = useUIStore();
  const t = useT();
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 h-[52px] w-full border-b bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-400 to-cyan-400">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <span className="text-xl font-semibold">Skywork</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title={t('nav.desktopView')}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title={t('nav.tabletView')}
          >
            <Tablet className="h-5 w-5" />
          </Button>

          <LangSwitch />

          <Button
            onClick={() => setRightPanelOpen(true)}
            className="h-9 bg-black text-white hover:bg-gray-800"
          >
            {session?.user ? (
              <>
                <UserIcon className="mr-2 h-4 w-4" />
                <span className="max-w-[140px] truncate">{session.user.name || session.user.email}</span>
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {t('auth.signIn')}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}