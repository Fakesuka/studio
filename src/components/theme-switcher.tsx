'use client';

import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseLabelClasses =
    'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground';
  const checkedLabelClasses = 'border-primary';

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-[98px] w-full" />
        <Skeleton className="h-[98px] w-full" />
        <Skeleton className="h-[98px] w-full" />
      </div>
    );
  }

  return (
    <RadioGroup
      value={theme}
      onValueChange={setTheme}
      className="grid grid-cols-3 gap-4"
    >
      <div>
        <RadioGroupItem value="light" id="light" className="peer sr-only" />
        <Label
          htmlFor="light"
          className={cn(
            baseLabelClasses,
            theme === 'light' && checkedLabelClasses
          )}
        >
          <Sun className="mb-2 h-6 w-6" />
          Светлая
        </Label>
      </div>
      <div>
        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
        <Label
          htmlFor="dark"
          className={cn(
            baseLabelClasses,
            theme === 'dark' && checkedLabelClasses
          )}
        >
          <Moon className="mb-2 h-6 w-6" />
          Тёмная
        </Label>
      </div>
      <div>
        <RadioGroupItem value="system" id="system" className="peer sr-only" />
        <Label
          htmlFor="system"
          className={cn(
            baseLabelClasses,
            theme === 'system' && checkedLabelClasses
          )}
        >
          <Laptop className="mb-2 h-6 w-6" />
          Системная
        </Label>
      </div>
    </RadioGroup>
  );
}
