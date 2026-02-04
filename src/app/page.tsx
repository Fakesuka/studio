'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getTelegramUser } from '@/lib/telegram';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();
  const { theme } = useTheme();
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

      // If user has visited before, auto-redirect to dashboard immediately
      if (hasVisited === 'true') {
        setIsReturningUser(true);
        router.push('/dashboard');
        return;
      }
    }
  }, [router]);

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  const backgroundImage = theme === 'light' ? '/BCKWHITE.PNG' : '/BCKDARK.PNG';

  return (
    <div className="relative flex min-h-screen w-screen flex-col overflow-hidden text-slate-900 dark:text-white">
      {/* Welcome Background */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="YakGo welcome background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/45" />
      </div>

      {/* Aurora Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-neon-cyan/25 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-[35%] -right-[20%] h-[60vh] w-[60vw] rounded-full bg-neon-purple/20 blur-[120px] animate-aurora" />
        <div className="absolute -bottom-[10%] left-[15%] h-[50vh] w-[50vw] rounded-full bg-neon-pink/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col justify-end px-6 pb-10">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Добро пожаловать
          </p>
          <h1 className="text-3xl font-display font-semibold text-white">
            Ваш надежный помощник на дорогах
          </h1>
          <p className="text-sm text-white/70">
            Помощь на дopoгах, эвакуация, доставка топлива и многое другое — в один клик.
          </p>
          {userName && (
            <p className="mx-auto w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs text-neon-cyan">
              Привет, {userName}
            </p>
          )}
          {!isReturningUser && (
            <Button
              size="lg"
              variant="neon"
              className="w-full text-base font-bold tracking-wide"
              onClick={handleEnter}
            >
              Начать
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
