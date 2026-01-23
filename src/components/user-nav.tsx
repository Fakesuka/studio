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
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get data from Telegram WebApp first
        const telegramUser = getTelegramUser();
        if (telegramUser) {
          setName(`${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim());
          setEmail(telegramUser.username ? `@${telegramUser.username}` : '');
          setPhotoUrl(telegramUser.photo_url || '');
        }

        // Also fetch from API to ensure consistency
        const profile = await api.getProfile();
        if (profile.name) {
          setName(profile.name);
        }
        if (profile.avatarUrl) {
          setPhotoUrl(profile.avatarUrl);
        }
        // Set Telegram ID as fallback email if no username
        if (!email && profile.telegramId) {
          setEmail(`ID: ${profile.telegramId}`);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
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
              {email}
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
