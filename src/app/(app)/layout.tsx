'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { TelegramGuard } from '@/components/telegram-guard';
import { AppProvider } from '@/context/AppContext';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDriverRoute = pathname.startsWith('/driver');

  return (
    <TelegramGuard>
      <AppProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Header />
          <main className="flex flex-1 flex-col bg-background p-4 pb-20 md:gap-8 md:p-8 md:pb-20">
            {children}
          </main>
          {isDriverRoute ? <DriverBottomNav /> : <BottomNav />}
        </div>
      </AppProvider>
    </TelegramGuard>
  );
}
