'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { TelegramGuard } from '@/components/telegram-guard';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { ErrorBoundary } from '@/components/error-boundary';

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
    <div className="relative flex min-h-screen w-screen flex-col overflow-hidden bg-aurora-gradient text-white">
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-[50vh] w-[50vw] bg-neon-cyan/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 h-[50vh] w-[50vw] bg-neon-purple/10 blur-[120px] animate-aurora" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[size:40px_40px] opacity-[0.03]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Header />
        <main className="mt-[calc(env(safe-area-inset-top)+104px)] flex flex-1 flex-col p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:mt-[104px] md:gap-8 md:p-8 md:pb-8 lg:px-12 xl:px-16">
          {children}
        </main>
        {showDriverNav ? <DriverBottomNav /> : <BottomNav />}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <TelegramGuard>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </TelegramGuard>
    </ErrorBoundary>
  );
}
