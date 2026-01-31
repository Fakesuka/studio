'use client';

import { Bell, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAppContext } from '@/context/AppContext';
import { RoleSwitcher } from './role-switcher';
import Image from 'next/image';

export function Header() {
  const { cart, isDriver, currentRole, setCurrentRole } = useAppContext();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isDriverRole = currentRole === 'driver';

  return (
    <header className="sticky top-0 z-40 flex min-h-[56px] items-center gap-2 border-b bg-gradient-to-b from-slate-100 to-white px-3 pb-3 pt-[calc(env(safe-area-inset-top)+48px)] dark:from-slate-900 dark:to-slate-950 sm:gap-4 sm:px-4 lg:min-h-[60px] lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Image src="/logo.svg" alt="YakGo" width={92} height={32} priority />
      </Link>
      <div className="flex-1" />
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDriver={isDriver}
        className="mr-2"
      />
      {isDriverRole ? (
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Уведомления</span>
        </Button>
      ) : (
        <Link href="/cart" passHref>
          <Button variant="ghost" size="icon" className="relative rounded-full shrink-0">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
            <span className="sr-only">Корзина</span>
          </Button>
        </Link>
      )}
    </header>
  );
}
