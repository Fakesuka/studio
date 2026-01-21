'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { AppProvider } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { bottomMenuItems, driverBottomMenuItems } from '@/lib/menu-items';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDriverRoute = pathname.startsWith('/driver');

  const clientRoutes = bottomMenuItems.map(i => i.href);
  // Correctly order the driver routes for swipe logic
  const driverRoutes = [
    '/driver/dashboard',
    '/driver/history',
    '/marketplace',
    '/driver/profile',
  ];

  const routes = isDriverRoute ? driverRoutes : clientRoutes;

  const handleSwiped = (eventData: { dir: string }) => {
    // Disable swipe on pages with complex touch interactions like carousels
    const noSwipePaths = ['/marketplace'];
    if (noSwipePaths.some(p => pathname.startsWith(p))) {
      return;
    }

    const currentIndex = routes.findIndex(route => pathname.startsWith(route));
    if (currentIndex === -1) return;

    if (eventData.dir === 'Left') {
      const nextIndex = (currentIndex + 1) % routes.length;
      router.push(routes[nextIndex]);
    } else if (eventData.dir === 'Right') {
      const prevIndex = (currentIndex - 1 + routes.length) % routes.length;
      router.push(routes[prevIndex]);
    }
  };

  const handlers = useSwipeable({
    onSwiped: handleSwiped,
    preventScrollOnSwipe: true,
    trackMouse: false, // Disable for mouse to avoid conflicts with selection etc.
    trackY: false,
  });

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main
          {...handlers}
          className="flex flex-1 flex-col bg-background p-4 pb-20 md:gap-8 md:p-8 md:pb-20"
        >
          {children}
        </main>
        {isDriverRoute ? <DriverBottomNav /> : <BottomNav />}
      </div>
    </AppProvider>
  );
}
