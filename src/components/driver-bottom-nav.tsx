'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { driverBottomMenuItems } from '@/lib/menu-items';
import { useAppContext } from '@/context/AppContext';

export function DriverBottomNav() {
  const pathname = usePathname();
  const { orders } = useAppContext();
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const syncWorkingState = () => {
      const stored = localStorage.getItem('driverIsWorking');
      setIsWorking(stored === 'true');
    };

    syncWorkingState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'driverIsWorking') {
        syncWorkingState();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('driver-working-change', syncWorkingState);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('driver-working-change', syncWorkingState);
    };
  }, []);

  // Check if there are new available orders
  const availableOrders = isWorking
    ? (orders || []).filter(o => o.status === 'Ищет исполнителя')
    : [];
  const hasNewOrders = availableOrders.length > 0;

  // Split menu items into 3 groups: left, center (wider), right
  const leftItem = driverBottomMenuItems[0];
  const centerItem = driverBottomMenuItems[1];
  const rightItem = driverBottomMenuItems[2];

  const renderCapsule = (item: typeof driverBottomMenuItems[0], isCenter: boolean = false) => {
    const isActive = pathname.startsWith(item.href);
    const isDashboard = item.href === '/driver/dashboard';
    const shouldPulse = isDashboard && hasNewOrders && isWorking && !isActive;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'relative flex items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-300',
          isCenter ? 'h-14 w-24' : 'h-14 w-14',
          isActive
            ? 'bg-gradient-to-tr from-neon-purple/20 to-neon-pink/20 border-neon-purple/30'
            : 'hover:bg-white/5 hover:border-white/20',
          shouldPulse && 'border-neon-purple/60'
        )}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
        )}
        {shouldPulse && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_14px_rgba(168,85,247,0.45)] animate-pulse" />
        )}
        <item.icon className={cn(
          "h-5 w-5 z-10",
          isActive ? "text-neon-purple" : "text-gray-400",
          shouldPulse && "text-neon-purple"
        )} />
        <span className="sr-only">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
        {leftItem && renderCapsule(leftItem)}
        {centerItem && renderCapsule(centerItem, true)}
        {rightItem && renderCapsule(rightItem)}
      </div>
    </nav>
  );
}
