'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  // Split menu items into 3 groups: left, center (wider), right
  const leftItem = bottomMenuItems[0];
  const centerItem = bottomMenuItems[1];
  const rightItem = bottomMenuItems[2];

  const renderCapsule = (item: typeof bottomMenuItems[0], isCenter: boolean = false) => {
    const isActive = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'relative flex items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-300',
          isCenter ? 'h-14 w-24' : 'h-14 w-14',
          isActive
            ? 'bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/30'
            : 'hover:bg-white/5 hover:border-white/20'
        )}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
        )}
        <item.icon className={cn("h-5 w-5 z-10", isActive ? "text-neon-cyan" : "text-gray-400")} />
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
