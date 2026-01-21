'use client';

import { UserNav } from '@/components/user-nav';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from './ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="hidden md:flex" />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <Link href="/cart" passHref>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            2
          </span>
          <span className="sr-only">Корзина</span>
        </Button>
      </Link>
      <UserNav />
    </header>
  );
}
