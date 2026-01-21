'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ListChecks, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/driver/dashboard', label: 'Заказы', icon: Bell },
  { href: '/driver/history', label: 'История', icon: ListChecks },
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/driver/profile', label: 'Профиль', icon: User },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
        {menuItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 p-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
