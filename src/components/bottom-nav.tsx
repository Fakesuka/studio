'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ScrollText,
  Store,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/orders', label: 'Заказы', icon: ScrollText },
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/profile', label: 'Профиль', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
        {menuItems.map(item => {
          const isActive = pathname === item.href;
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
