'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { driverBottomMenuItems } from '@/lib/menu-items';

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto flex h-14 w-[min(420px,calc(100%-2rem))] items-center justify-between rounded-full border border-white/70 bg-white/85 p-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
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
