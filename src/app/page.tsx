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
            <Image src="/logo.png" alt="YakGo" width={96} height={96} priority />
          </div>

          <div className="mb-8 text-center">
            {isReturningUser ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-xl animate-pulse-glow" />
                  <div className="absolute inset-2 rounded-full border border-neon-cyan/50 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse" />
                  <div className="relative h-full w-full rounded-full bg-white/5 backdrop-blur">
                    <Image src="/logo.png" alt="YakGo" fill className="object-contain p-3" priority />
                  </div>
                </div>
                <p className="text-sm text-neon-cyan/80">Загрузка профиля...</p>
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
