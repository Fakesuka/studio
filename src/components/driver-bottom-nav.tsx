'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { driverBottomMenuItems } from '@/lib/menu-items';

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 md:hidden">
      <div className="mx-auto flex h-14 w-[min(420px,calc(100%-2rem))] items-center justify-between rounded-full border border-slate-200 bg-white/90 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {driverBottomMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 flex-1 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'text-primary drop-shadow-[0_0_10px_rgba(37,99,235,0.35)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
