'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PawPrint, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: '首頁',
    icon: Home,
  },
  {
    href: '/pets',
    label: '寵物',
    icon: PawPrint,
  },
  {
    href: '/diary/new',
    label: '記錄',
    icon: PlusCircle,
    highlight: true,
  },
  {
    href: '/stats',
    label: '統計',
    icon: BarChart3,
  },
  {
    href: '/settings',
    label: '設定',
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                item.highlight && 'relative',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.highlight ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -mt-4">
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className={cn(
                'text-xs',
                item.highlight && '-mt-1'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
