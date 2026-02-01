'use client';

import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '@/context/AppContext';

export function Header() {
  const { currentRole } = useAppContext();
  const isDriverRole = currentRole === 'driver';

  // Minimal header - only show notifications for driver
  if (!isDriverRole) {
    return null;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-12 items-center justify-end px-4 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/60 to-transparent">
      <Button variant="ghost" size="icon" className="relative rounded-full shrink-0 h-9 w-9">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Уведомления</span>
      </Button>
    </header>
  );
}
