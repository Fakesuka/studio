'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl shadow-neon-cyan/5 backdrop-blur-xl max-w-md mx-auto">
        {bottomMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex h-12 w-14 items-center justify-center rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
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
