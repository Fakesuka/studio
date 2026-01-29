'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto flex h-16 w-[min(420px,calc(100%-2rem))] items-center justify-between rounded-full border bg-card/90 px-6 shadow-lg backdrop-blur">
        {bottomMenuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          const isCenter = index === 1;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/60',
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
