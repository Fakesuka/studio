'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  if (!isDriver) {
    return null;
  }

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
    // Auto-navigate to the correct home page
    if (role === 'driver') {
      router.push('/driver/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className={cn("inline-flex items-center rounded-full bg-muted p-1", className)}>
      <button
        onClick={() => handleRoleChange('client')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
          currentRole === 'client'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим клиента"
      >
        <User className="h-4 w-4" />
        <span>Клиент</span>
      </button>
      <button
        onClick={() => handleRoleChange('driver')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
          currentRole === 'driver'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим водителя"
      >
        <Car className="h-4 w-4" />
        <span>Водитель</span>
      </button>
    </div>
  );
}
