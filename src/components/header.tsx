'use client';

import { ShoppingCart, Car } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Car className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Vroom</span>
      </Link>
      <div className="flex-1" />
      <Link href="/cart" passHref>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            2
          </span>
          <span className="sr-only">Корзина</span>
        </Button>
      </Link>
    </header>
  );
}
