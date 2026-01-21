'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { AppProvider } from '@/context/AppContext';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDriverRoute = pathname.startsWith('/driver');

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 pb-20 md:gap-6 md:p-6 md:pb-20">
          {children}
        </main>
        {isDriverRoute ? <DriverBottomNav /> : <BottomNav />}
      </div>
    </AppProvider>
  );
}
