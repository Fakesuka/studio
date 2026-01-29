'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto flex h-16 w-[min(440px,calc(100%-2rem))] items-center justify-between rounded-[32px] border border-white/20 bg-white/25 px-6 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
        {bottomMenuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          const isCenter = index === 1;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-white/35 text-slate-700 shadow-sm dark:bg-slate-800/60 dark:text-slate-200',
                  isCenter && 'h-12 w-12 -translate-y-2'
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
