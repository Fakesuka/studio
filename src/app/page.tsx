'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getTelegramUser } from '@/lib/telegram';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
        }, 2000); // Slightly longer delay to enjoy the animation
      }
    }
  }, [router]);

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-aurora-gradient text-white">
      {/* Animated Aurora Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-neon-cyan/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-[20%] h-[60vh] w-[60vw] rounded-full bg-neon-purple/20 blur-[100px] animate-aurora" />
        <div className="absolute -bottom-[10%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-neon-pink/10 blur-[80px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
        {/* Glass Card Container */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40 animate-in fade-in zoom-in duration-700">

          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4 h-20 w-20">
              <Image
                src="/images/logo.png"
                alt="YakGo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-display text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple drop-shadow-sm">
              YakGo
            </h1>
          </div>

          <div className="mb-8 text-center">
            {isReturningUser ? (
              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-white">С возвращением!</h2>
                <p className="font-display text-xl text-neon-cyan">{userName}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                  <span>Загрузка профиля...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-medium leading-snug text-white">
                  Ваш надежный помощник на дорогах
                </h2>
                <p className="text-sm text-gray-400">
                  Помощь на дopoгах, эвакуация, доставка топлива и многое другое — в один клик.
                </p>
                {userName && (
                  <p className="rounded-full bg-white/5 px-3 py-1 text-xs text-neon-cyan w-fit mx-auto border border-white/10">
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

        <p className="mt-8 text-xs text-gray-500">
          version 2.1.0 • Aurora Edition
        </p>
      </div>
    </div>
  );
}
