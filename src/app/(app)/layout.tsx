'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { TelegramGuard } from '@/components/telegram-guard';
import { AppProvider, useAppContext } from '@/context/AppContext';

// Home pages for each role
const CLIENT_HOME = '/dashboard';
const DRIVER_HOME = '/driver/dashboard';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentRole, isContextLoading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const showDriverNav = currentRole === 'driver';

  // Redirect to role-specific home page on initial load
  useEffect(() => {
    // Only redirect once, and only after context is loaded
    if (isContextLoading || hasRedirected.current) return;

    // Check if user is on a generic entry point
    const isOnClientHome = pathname === '/' || pathname === '/dashboard';
    const isOnDriverHome = pathname === '/driver/dashboard';

    // Redirect driver from client pages to driver home
    if (currentRole === 'driver' && isOnClientHome) {
      hasRedirected.current = true;
      router.replace(DRIVER_HOME);
      return;
    }

    // Redirect client from driver pages to client home
    if (currentRole === 'client' && isOnDriverHome) {
      hasRedirected.current = true;
      router.replace(CLIENT_HOME);
      return;
    }
  }, [currentRole, isContextLoading, pathname, router]);

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
