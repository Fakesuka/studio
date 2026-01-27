'use client';

import { useRouter } from 'next/navigation';
import { User, Car, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type UserRole = 'client' | 'driver';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDriver: boolean;
  className?: string;
}

export function RoleSwitcher({ currentRole, onRoleChange, isDriver, className }: RoleSwitcherProps) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);

  // Show hint on first load if user hasn't seen it
  useEffect(() => {
    if (isDriver) {
      const hasSeenHint = localStorage.getItem('roleSwitcherHintSeen');
      if (!hasSeenHint) {
        setShowHint(true);
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setShowHint(false);
          localStorage.setItem('roleSwitcherHintSeen', 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isDriver]);

  if (!isDriver) {
    return null;
  }

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
    setShowHint(false);
    localStorage.setItem('roleSwitcherHintSeen', 'true');
    // Auto-navigate to the correct home page
    if (role === 'driver') {
      router.push('/driver/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Popover open={showHint} onOpenChange={setShowHint}>
      <PopoverTrigger asChild>
        <div className={cn("inline-flex items-center rounded-full bg-muted p-0.5 shrink-0 cursor-pointer", className)}>
      <button
        onClick={() => handleRoleChange('client')}
        className={cn(
          "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
          currentRole === 'client'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим клиента"
        title="Режим клиента"
      >
        <User className="h-3 w-3 shrink-0" />
        <span className="hidden md:inline">Клиент</span>
      </button>
      <button
        onClick={() => handleRoleChange('driver')}
        className={cn(
          "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
          currentRole === 'driver'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Режим водителя"
        title="Режим водителя"
      >
        <Car className="h-3 w-3 shrink-0" />
        <span className="hidden md:inline">Водитель</span>
      </button>
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-64 p-3" sideOffset={8}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Переключатель ролей</p>
            <p className="text-xs text-muted-foreground">
              Используйте этот слайдер для переключения между режимами клиента и водителя.
              Нажмите на нужную роль для переключения.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
