'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';
import { useAppContext } from '@/context/AppContext';

export function BottomNav() {
  const pathname = usePathname();
  const { orders, marketplaceOrders } = useAppContext();
  const [hasOrderUpdates, setHasOrderUpdates] = useState(false);
  const [hasMarketplaceUpdates, setHasMarketplaceUpdates] = useState(false);

  const orderSignature = useMemo(() => (
    (orders || [])
      .map(order => `${order.id}:${order.status}`)
      .join('|')
  ), [orders]);

  const marketplaceSignature = useMemo(() => (
    (marketplaceOrders || [])
      .map(order => `${order.id}:${order.status}`)
      .join('|')
  ), [marketplaceOrders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('clientOrdersSignature');
    if (!stored) {
      localStorage.setItem('clientOrdersSignature', orderSignature);
      setHasOrderUpdates(false);
      return;
    }
    setHasOrderUpdates(stored !== orderSignature);
  }, [orderSignature]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('marketplaceOrdersSignature');
    if (!stored) {
      localStorage.setItem('marketplaceOrdersSignature', marketplaceSignature);
      setHasMarketplaceUpdates(false);
      return;
    }
    setHasMarketplaceUpdates(stored !== marketplaceSignature);
  }, [marketplaceSignature]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname.startsWith('/dashboard')) {
      localStorage.setItem('clientOrdersSignature', orderSignature);
      setHasOrderUpdates(false);
    }
  }, [pathname, orderSignature]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname.startsWith('/marketplace')) {
      localStorage.setItem('marketplaceOrdersSignature', marketplaceSignature);
      setHasMarketplaceUpdates(false);
    }
  }, [pathname, marketplaceSignature]);

  // Split menu items into 3 groups: left, center (wider), right
  const leftItem = bottomMenuItems[0];
  const centerItem = bottomMenuItems[1];
  const rightItem = bottomMenuItems[2];

  const renderCapsule = (item: typeof bottomMenuItems[0], isCenter: boolean = false) => {
    const isActive = pathname.startsWith(item.href);
    const isDashboard = item.href === '/dashboard';
    const isMarketplace = item.href === '/marketplace';
    const shouldPulse = (isDashboard && hasOrderUpdates && !isActive)
      || (isMarketplace && hasMarketplaceUpdates && !isActive);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'relative flex items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-300',
          isCenter ? 'h-14 w-24' : 'h-14 w-14',
          isActive
            ? 'bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/30'
            : 'hover:bg-white/5 hover:border-white/20',
          shouldPulse && 'border-neon-cyan/60'
        )}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
        )}
        {shouldPulse && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_14px_rgba(34,211,238,0.45)] animate-pulse" />
        )}
        <item.icon className={cn(
          "h-5 w-5 z-10",
          isActive ? "text-neon-cyan" : "text-gray-400",
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
