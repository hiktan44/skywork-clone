'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Sparkles, Folder, Clock, Eye, MessageSquare, Search, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { useT } from '@/lib/i18n';

const sidebarItems = [
  { id: 'home', label: 'nav.home', icon: Home, href: '/' },
  { id: 'new', label: 'nav.new', icon: Plus, href: '/?action=new' },
  { id: 'skills', label: 'nav.skills', icon: Sparkles, href: '/skills' },
  { id: 'projects', label: 'nav.projects', icon: Folder, href: '/' },
  { id: 'scheduled', label: 'nav.scheduled', icon: Clock, href: '/scheduled', badge: 'common.new' },
  { id: 'showcase', label: 'nav.showcase', icon: Eye, href: '/showcase' },
  { id: 'im', label: 'nav.connect', icon: MessageSquare, href: '#', external: true },
  { id: 'search', label: 'nav.search', icon: Search, href: '#' },
  { id: 'help', label: 'nav.help', icon: HelpCircle, href: '#' },
];

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const pathname = usePathname();
  const t = useT();

  return (
    <aside
      className={cn(
        'fixed left-0 top-[52px] z-40 flex h-[calc(100vh-52px)] flex-col border-r bg-white transition-all duration-200',
        sidebarOpen ? 'w-[220px]' : 'w-[44px]'
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto p-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== '#' && item.href !== '/?action=new' && pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'mb-1 flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors',
                sidebarOpen ? 'justify-start gap-3' : 'justify-center',
                isActive && 'bg-purple-50 text-purple-700'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="truncate flex-1">{t(item.label)}</span>
                  {item.badge && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {t(item.badge)}
                    </span>
                  )}
                  {item.external && <ChevronRight className="h-4 w-4 text-gray-400" />}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}