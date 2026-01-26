'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { TelegramGuard } from '@/components/telegram-guard';
import { AppProvider, useAppContext } from '@/context/AppContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentRole } = useAppContext();
  const showDriverNav = currentRole === 'driver';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col bg-background p-4 pb-20 md:gap-8 md:p-8 md:pb-20">
        {children}
      </main>
      {showDriverNav ? <DriverBottomNav /> : <BottomNav />}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TelegramGuard>
      <AppProvider>
        <LayoutContent>{children}</LayoutContent>
      </AppProvider>
    </TelegramGuard>
  );
}
