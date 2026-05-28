'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Sparkles, Folder, Clock, Eye, MessageSquare, Search, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

const sidebarItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'new', label: 'New Projects', icon: Plus, href: '/?action=new' },
  { id: 'skills', label: 'Explore Skills', icon: Sparkles, href: '/skills' },
  { id: 'projects', label: 'Projects', icon: Folder, href: '/' },
  { id: 'scheduled', label: 'Scheduled Tasks', icon: Clock, href: '/scheduled', badge: 'New' },
  { id: 'showcase', label: 'Showcase', icon: Eye, href: '/showcase' },
  { id: 'im', label: 'Connect IM channel', icon: MessageSquare, href: '#', external: true },
  { id: 'search', label: 'Search', icon: Search, href: '#' },
  { id: 'help', label: 'Help', icon: HelpCircle, href: '#' },
];

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const pathname = usePathname();

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
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
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