'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getTelegramUser } from '@/lib/telegram';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [ready, setReady] = useState(false);

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

    // Only show welcome UI after we confirmed it's a new user
    setReady(true);
  }, [router]);

  // Show blank screen matching splash while checking / redirecting
  if (!ready) {
    return <div className="min-h-screen w-screen bg-[#080B18]" />;
  }

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#080B18] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,15,0.2),rgba(6,7,15,0.95))]" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10 px-6">
        <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <Image src="/logo.png" alt="YakGo" width={72} height={72} priority />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-[0.35em]">YAKGO</h1>
              <p className="mt-3 text-sm text-white/60">
                Ваш надёжный помощник на дорогах Якутии
              </p>
              {userName && (
                <p className="mt-3 text-sm text-cyan-200/90">
                  {isReturningUser ? `С возвращением, ${userName}` : `Привет, ${userName}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {!isReturningUser && (
          <Button
            size="lg"
            variant="neon"
            className="w-full max-w-xs text-base font-bold tracking-wide"
            onClick={handleEnter}
          >
            Регистрация через Telegram
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
