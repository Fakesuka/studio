'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp, getTelegramUser } from '@/lib/telegram';
import Image from 'next/image';

// Этапы загрузки
const loadingStages = [
  'Инициализация...',
  'Подключение к сервису...',
  'Загрузка данных...',
  'Почти готово...',
];

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if Telegram and get user
    const isTg = isTelegramWebApp();
    setIsTelegram(isTg);

    if (isTg) {
      const user = getTelegramUser();
      if (user?.first_name) {
        setUserName(user.first_name);
      }
    }

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Varying speed for realism
        const increment = prev < 30 ? 3 : prev < 70 ? 2 : prev < 90 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    // Update loading stage
    const stageInterval = setInterval(() => {
      setStageIndex(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 800);

    // Fade out and hide welcome
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3200);

    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 3700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  // Show welcome/loading screen
  if (showWelcome || isTelegram === null) {
    return (
      <div className={`loading-screen min-h-screen w-full relative overflow-hidden bg-[#06070F] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,15,0.2),rgba(6,7,15,0.95))]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          <div className="relative mb-8 flex flex-col items-center">
            <div className="absolute inset-0 -z-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-[120px]" />
            <Image
              src="/logo.png"
              alt="YakGo"
              width={240}
              height={240}
              priority
              className="w-[42vw] max-w-[280px] h-auto drop-shadow-[0_0_40px_rgba(0,180,255,0.35)] animate-pulse"
            />
            <h1 className="mt-6 text-4xl font-semibold tracking-[0.35em] text-white">
              YAKGO
            </h1>
            <p className="mt-3 text-sm text-white/60">
              Ваш надёжный помощник на дорогах Якутии
            </p>
          </div>

          {userName && (
            <p className="text-sm text-cyan-200/90">
              Добро пожаловать, {userName}!
            </p>
          )}

          <div className="mt-10 w-72 max-w-full">
            <p className="text-white/50 text-xs text-center mb-3 h-4 transition-all duration-300">
              {loadingStages[stageIndex]}
            </p>
            <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              <div
                className="h-full rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #22D3EE 0%, #A855F7 50%, #22D3EE 100%)',
                  backgroundSize: '200% 100%',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
              </div>
            </div>
            <p className="text-cyan-300/70 text-[10px] text-center mt-2 font-mono">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }

          :global(.animate-shimmer) {
            animation: shimmer 2s infinite;
          }

          :global(.animate-shine) {
            animation: shine 1.5s infinite;
          }
        `}</style>
      </div>
    );
  }

  // If not Telegram, show warning
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#06070F] flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-[110px]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,15,0.2),rgba(6,7,15,0.95))]" />
        </div>

        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="YakGo"
              width={200}
              height={200}
              priority
              className="w-[42vw] max-w-[280px] h-auto drop-shadow-[0_0_40px_rgba(0,180,255,0.35)] animate-pulse"
            />
            <h1 className="mt-5 text-3xl font-semibold tracking-[0.35em] text-white">YAKGO</h1>
            <p className="mt-3 text-sm text-white/60">
              Ваш надёжный помощник на дорогах Якутии
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2">Доступ ограничен</p>
            <p className="text-white/50 text-sm mb-6">
              Приложение работает только внутри Telegram
            </p>
            <a
              href="https://t.me/yaktgo_bot"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-400 hover:from-cyan-400 hover:to-purple-300 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If Telegram, render children
  return <>{children}</>;
}
