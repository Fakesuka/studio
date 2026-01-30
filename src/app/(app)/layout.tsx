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
    <div className="relative flex min-h-screen w-screen flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F7F3EE] via-[#F1F6FF] to-[#E8F0FF] dark:from-[#0F1115] dark:via-[#1A1024] dark:to-[#121826]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#6B7CFF]/10 via-transparent to-transparent dark:from-[#22D3EE]/15" />
        <div className="absolute inset-0 opacity-70 dark:opacity-60">
          <div className="absolute left-10 top-12 h-72 w-72 rounded-full bg-white/70 blur-3xl dark:bg-[#22D3EE]/10" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#BFD6FF]/60 blur-[140px] dark:bg-[#3B82F6]/15" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col bg-white/70 p-4 pb-28 backdrop-blur-xl dark:bg-slate-950/40 md:gap-8 md:p-8 md:pb-28">
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
