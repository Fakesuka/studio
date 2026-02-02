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

      // If user has visited before, auto-redirect to dashboard
      if (hasVisited === 'true') {
        setIsReturningUser(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000); // Slightly longer delay to enjoy the animation
      }
    }
  }, [router]);

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  const backgroundImage = theme === 'light' ? '/bckwhite.png' : '/bckdark.png';

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden text-slate-900 dark:text-white">
      {/* Welcome Background */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="YakGo welcome background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
      </div>

      {/* Aurora Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-neon-cyan/25 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-[35%] -right-[20%] h-[60vh] w-[60vw] rounded-full bg-neon-purple/20 blur-[120px] animate-aurora" />
        <div className="absolute -bottom-[10%] left-[15%] h-[50vh] w-[50vw] rounded-full bg-neon-pink/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
        {/* Glass Card Container */}
        <div className="w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40 animate-in fade-in zoom-in duration-700">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-white/70">
            Добро пожаловать
          </p>

          {/* Logo Section */}
          {!isReturningUser && (
            <div className="mb-8 flex flex-col items-center">
              <Image src="/logo.png" alt="YakGo" width={96} height={96} priority />
            </div>
          )}

          <div className="mb-8 text-center">
            {isReturningUser ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-40 w-40 rounded-3xl border border-emerald-300/40 bg-emerald-400/10 shadow-[0_0_35px_rgba(16,185,129,0.45)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-300/30 via-cyan-300/10 to-blue-400/20 animate-pulse-glow" />
                  <Image
                    src="/logo.png"
                    alt="YakGo"
                    fill
                    priority
                    className="relative object-cover"
                  />
                </div>
                <span className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                  YakGo
                </span>
                <p className="text-lg font-medium text-neon-cyan">
                  С возвращением{userName ? `, ${userName}` : ''}!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-medium leading-snug text-white">
                  Ваш надежный помощник на дорогах
                </h2>
                <p className="text-sm text-white/70">
                  Помощь на дopoгах, эвакуация, доставка топлива и многое другое — в один клик.
                </p>
                {userName && (
                  <p className="rounded-full bg-white/10 px-3 py-1 text-xs text-neon-cyan w-fit mx-auto border border-white/20">
                    Привет, {userName}
                  </p>
                )}
              </div>
            )}
          </div>

          {!isReturningUser && (
            <div className="space-y-3">
              <Button
                size="lg"
                variant="neon"
                className="w-full text-base font-bold tracking-wide"
                onClick={handleEnter}
              >
                Начать
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-white/60">
          version 2.1.0 • Aurora Edition
        </p>
      </div>
    </div>
  );
}
