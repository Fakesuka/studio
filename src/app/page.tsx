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
      <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F7F3EE] via-[#F1F6FF] to-[#E8F0FF] dark:from-[#0F1115] dark:via-[#1A1024] dark:to-[#121826]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#6B7CFF]/15 via-transparent to-transparent dark:from-[#22D3EE]/20" />
          <div className="absolute inset-0 opacity-70 dark:opacity-60">
            <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl dark:bg-[#22D3EE]/15" />
            <div className="absolute bottom-10 right-16 h-80 w-80 rounded-full bg-[#BFD6FF]/60 blur-[140px] dark:bg-[#3B82F6]/20" />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-400/15 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-16 right-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px]" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="flex flex-col items-center gap-4 rounded-[32px] border border-white/60 bg-white/70 px-6 py-10 text-center text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:shadow-[0_0_45px_rgba(34,211,238,0.15)]">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white shadow-2xl backdrop-blur">
            <Image
              src="/logo.svg"
              alt="YakGo"
              width={160}
              height={56}
              className="drop-shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                С возвращением,
              </h1>
              <p className="mt-2 text-2xl font-semibold text-slate-700 dark:text-cyan-100 sm:text-3xl">
                {userName}!
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-cyan-200">
              <div className="h-2 w-2 rounded-full bg-[#4658E5] animate-pulse dark:bg-[#22D3EE]" />
              <p className="mt-2 text-2xl font-semibold text-blue-100 sm:text-3xl">
                {userName}!
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <p>Перенаправление...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show first-time welcome screen
  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F7F3EE] via-[#F1F6FF] to-[#E8F0FF] dark:from-[#0F1115] dark:via-[#1A1024] dark:to-[#121826]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#6B7CFF]/15 via-transparent to-transparent dark:from-[#22D3EE]/20" />
        <div className="absolute inset-0 opacity-70 dark:opacity-60">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl dark:bg-[#22D3EE]/15" />
          <div className="absolute bottom-10 right-16 h-80 w-80 rounded-full bg-[#BFD6FF]/60 blur-[140px] dark:bg-[#3B82F6]/20" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl px-6">
        <div className="flex flex-col items-center gap-5 rounded-[32px] border border-white/60 bg-white/70 px-6 py-12 text-center text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:shadow-[0_0_45px_rgba(34,211,238,0.15)]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-400/15 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-16 right-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white shadow-2xl backdrop-blur">
          <Image
            src="/logo.svg"
            alt="YakGo"
            width={200}
            height={64}
            className="drop-shadow-lg"
          />
          <div>
            <p className="text-base font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-cyan-200/80">
            <p className="text-base font-medium uppercase tracking-[0.2em] text-blue-200/80">
              YakGo
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ваш надежный помощник
            </h1>
            <p className="mt-2 text-base text-slate-600 sm:text-lg dark:text-cyan-100/90">
            <p className="mt-2 text-base text-blue-100 sm:text-lg">
              На дорогах Якутии и по маршрутам в вашем городе.
            </p>
          </div>
          {userName && (
            <p className="text-lg font-semibold text-slate-700 dark:text-white/90">
            <p className="text-lg font-semibold text-white/90">
              Добро пожаловать, {userName}!
            </p>
          )}

          <div className="mt-4 flex w-full max-w-xs flex-col gap-4">
            <Button
              size="lg"
              className="h-12 w-full bg-gradient-to-b from-white to-[#E9EEFF] text-lg text-[#1F2A44] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_12px_24px_rgba(31,42,68,0.15)] hover:from-white hover:to-[#DCE5FF] dark:from-[#22D3EE] dark:to-[#10B981] dark:text-slate-900 dark:shadow-[0_0_30px_rgba(34,211,238,0.35)] dark:hover:from-[#2DE4F5] dark:hover:to-[#22D3EE]"
              className="h-12 w-full bg-white text-lg text-slate-900 hover:bg-slate-100"
              onClick={handleEnter}
            >
              Начать работу
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
