'use client';

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
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Winter Background with CSS */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center text-white p-4">
          <Snowflake className="h-16 w-16 text-blue-400 animate-pulse" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight drop-shadow-lg sm:text-5xl">
            С возвращением,
          </h1>
          <p className="mt-2 text-3xl font-semibold drop-shadow-lg">
            {userName}!
          </p>
          <div className="mt-6 flex items-center gap-2 text-blue-200">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-sm">Перенаправление...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show first-time welcome screen
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Winter Background with CSS */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center text-white p-4">
        <Snowflake className="h-16 w-16 text-blue-400" />
        <h1 className="mt-4 text-5xl font-bold tracking-tight drop-shadow-lg sm:text-6xl">
          YakGo
        </h1>
        <p className="mt-2 max-w-md text-lg text-blue-100 drop-shadow-lg">
          Ваш надежный помощник на дорогах Якутии.
        </p>
        {userName && (
          <p className="mt-4 text-xl font-semibold drop-shadow-lg">
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
