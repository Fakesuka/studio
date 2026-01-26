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
    <div className={cn("inline-flex items-center rounded-full bg-muted p-1", className)}>
      <button
        onClick={() => onRoleChange('client')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          currentRole === 'client'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="h-4 w-4" />
        Клиент
      </button>
      <button
        onClick={() => onRoleChange('driver')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          currentRole === 'driver'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Car className="h-4 w-4" />
        Водитель
      </button>
    </div>
  );
}
