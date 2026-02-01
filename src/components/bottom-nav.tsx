'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 shadow-2xl shadow-neon-cyan/5 backdrop-blur-xl">
        {bottomMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
              )}
              <item.icon className={cn("h-5 w-5 z-10", isActive && "text-neon-cyan")} />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
