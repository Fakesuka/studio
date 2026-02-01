'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

export function Header() {
  const { currentRole } = useAppContext();
  const isDriverRole = currentRole === 'driver';

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex min-h-[56px] items-center gap-2 bg-gradient-to-b from-black/80 via-black/60 to-transparent px-3 pb-6 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-sm sm:gap-4 sm:px-4 md:pb-8 md:pt-4 lg:min-h-[60px] lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Image src="/logo.png" alt="YakGo" width={140} height={48} priority className="h-12 w-auto object-contain" />
      </Link>
      <div className="flex-1" />
      {isDriverRole && (
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Уведомления</span>
        </Button>
      )}
    </header>
  );
}
