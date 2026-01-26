'use client';

import { User, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'client' | 'driver';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDriver: boolean;
  className?: string;
}

export function RoleSwitcher({ currentRole, onRoleChange, isDriver, className }: RoleSwitcherProps) {
  if (!isDriver) {
    return null;
  }

  return (
    <div className={cn("inline-flex items-center rounded-full bg-muted p-0.5", className)}>
      <button
        onClick={() => onRoleChange('client')}
        className={cn(
          "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
          currentRole === 'client'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим клиента"
      >
        <User className="h-3 w-3" />
        <span className="hidden sm:inline">Клиент</span>
      </button>
      <button
        onClick={() => onRoleChange('driver')}
        className={cn(
          "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
          currentRole === 'driver'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим водителя"
      >
        <Car className="h-3 w-3" />
        <span className="hidden sm:inline">Водитель</span>
      </button>
    </div>
  );
}
