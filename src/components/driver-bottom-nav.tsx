'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { driverBottomMenuItems } from '@/lib/menu-items';
import { useAppContext } from '@/context/AppContext';

export function DriverBottomNav() {
  const pathname = usePathname();
  const { orders } = useAppContext();

  // Check if there are new available orders
  const availableOrders = (orders || []).filter(o => o.status === 'Ищет исполнителя');
  const hasNewOrders = availableOrders.length > 0;

  // Split menu items into 3 groups: left, center (wider), right
  const leftItem = driverBottomMenuItems[0];
  const centerItem = driverBottomMenuItems[1];
  const rightItem = driverBottomMenuItems[2];

  const renderCapsule = (item: typeof driverBottomMenuItems[0], isCenter: boolean = false) => {
    const isActive = pathname.startsWith(item.href);
    const isDashboard = item.href === '/driver/dashboard';
    // Only pulse like heartbeat when there are new orders and not active
    const shouldPulse = isDashboard && hasNewOrders && !isActive;

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
          shouldPulse && 'animate-heartbeat border-neon-cyan/50'
        )}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
        )}
        <item.icon className={cn(
          "h-5 w-5 z-10",
          isActive ? "text-neon-purple" : "text-gray-400",
          shouldPulse && "text-neon-cyan"
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
