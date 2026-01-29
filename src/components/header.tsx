'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAppContext } from '@/context/AppContext';
import { RoleSwitcher } from './role-switcher';
import Image from 'next/image';

export function Header() {
  const { cart, isDriver, currentRole, setCurrentRole } = useAppContext();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="flex h-14 items-center gap-2 sm:gap-4 border-b bg-card px-3 sm:px-4 lg:h-[60px] lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Image src="/logo.svg" alt="YakGo" width={92} height={32} priority />
      </Link>
      <div className="flex-1" />
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDriver={isDriver}
        className="mr-1 sm:mr-2"
      />
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
    </header>
  );
}
