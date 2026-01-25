'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Snowflake, ArrowRight } from 'lucide-react';
import { getTelegramUser } from '@/lib/telegram';
import { useEffect, useState } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('yakgo_has_visited');

    // Get Telegram user data
    const telegramUser = getTelegramUser();

    if (telegramUser) {
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
      setUserName(fullName || telegramUser.first_name || 'Пользователь');

      // If user has visited before, auto-redirect to dashboard
      if (hasVisited === 'true') {
        setIsReturningUser(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    }
  }, [router]);

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  // Show welcome back message for returning users
  if (isReturningUser && userName) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1489675858715-77950c41b893?q=80&w=2070&auto=format&fit=crop"
            alt="Winter road in Yakutia"
            fill
            className="object-cover"
            data-ai-hint="winter road"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center text-primary-foreground p-4">
          <Snowflake className="h-16 w-16 text-primary animate-pulse" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight drop-shadow-md sm:text-5xl">
            С возвращением,
          </h1>
          <p className="mt-2 text-3xl font-semibold drop-shadow">
            {userName}!
          </p>
          <div className="mt-6 flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm">Перенаправление...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show first-time welcome screen
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1489675858715-77950c41b893?q=80&w=2070&auto=format&fit=crop"
          alt="Winter road in Yakutia"
          fill
          className="object-cover"
          data-ai-hint="winter road"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center text-primary-foreground p-4">
        <Snowflake className="h-16 w-16 text-primary" />
        <h1 className="mt-4 text-5xl font-bold tracking-tight drop-shadow-md sm:text-6xl">
          YakGo
        </h1>
        <p className="mt-2 max-w-md text-lg text-primary-foreground/90 drop-shadow">
          Ваш надежный помощник на дорогах Якутии.
        </p>
        {userName && (
          <p className="mt-4 text-xl font-semibold drop-shadow">
            Добро пожаловать, {userName}!
          </p>
        )}

        <div className="mt-10 flex w-full max-w-xs flex-col gap-4">
          <Button size="lg" className="w-full text-lg h-12" onClick={handleEnter}>
            Начать работу
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
