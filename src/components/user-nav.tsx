'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getTelegramUser } from '@/lib/telegram';

export function UserNav() {
  const [name, setName] = useState('Загрузка...');
  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Get data from Telegram WebApp
        const telegramUser = getTelegramUser();

        if (telegramUser) {
          // Use Telegram data directly
          const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
          setName(fullName);
          setUsername(telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`);
          if (telegramUser.photo_url) {
            setPhotoUrl(telegramUser.photo_url);
          }
        } else {
          // Fallback (shouldn't happen with TelegramGuard)
          setName('Пользователь');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setName('Пользователь');
      }
    };

    loadUserData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '..';
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={photoUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
