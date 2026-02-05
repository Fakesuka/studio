'use client';

import { useEffect, useState, useMemo } from 'react';
import { isTelegramWebApp, getTelegramUser, getTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

// Этапы загрузки
const loadingStages = [
  'Инициализация...',
  'Подключение к сервису...',
  'Загрузка данных...',
  'Почти готово...',
];

// Generate random particles data
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.2,
    dx: (Math.random() - 0.5) * 120,
    dy: (Math.random() - 0.5) * 120,
  }));
}

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  const particles = useMemo(() => generateParticles(25), []);

  useEffect(() => {
    // Expand Telegram WebApp immediately during splash
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

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
      <div className={`loading-screen min-h-screen w-full relative overflow-hidden bg-[#050d1a] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,94,120,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(12,80,110,0.45),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(7,28,48,0.8),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.1),rgba(4,8,16,0.95))]" />
        </div>

        {/* Neon particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full neon-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                background: `radial-gradient(circle, rgba(34,211,238,0.9), rgba(0,150,255,0.4))`,
                boxShadow: `0 0 ${p.size * 3}px rgba(34,211,238,0.6), 0 0 ${p.size * 6}px rgba(0,100,255,0.3)`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                ['--dx' as string]: `${p.dx}px`,
                ['--dy' as string]: `${p.dy}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          <div className="relative mb-10 flex flex-col items-center">
            <div className="absolute inset-0 -z-10 h-[36rem] w-[36rem] rounded-full bg-cyan-400/25 blur-[180px]" />
            <Image
              src="/logo.png"
              alt="YakGo"
              width={480}
              height={480}
              priority
              className="w-[90vw] max-w-[640px] h-auto drop-shadow-[0_0_80px_rgba(0,150,255,0.45)] animate-pulse"
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

        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }

          @keyframes neon-float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: var(--particle-opacity, 0.4);
            }
            25% {
              transform: translate(calc(var(--dx) * 0.5), calc(var(--dy) * -0.7)) scale(1.3);
              opacity: calc(var(--particle-opacity, 0.4) * 1.5);
            }
            50% {
              transform: translate(var(--dx), var(--dy)) scale(0.8);
              opacity: calc(var(--particle-opacity, 0.4) * 0.6);
            }
            75% {
              transform: translate(calc(var(--dx) * -0.3), calc(var(--dy) * 0.5)) scale(1.1);
              opacity: var(--particle-opacity, 0.4);
            }
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .animate-shine {
            animation: shine 1.5s infinite;
          }

          .neon-particle {
            animation: neon-float ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // If not Telegram, show warning
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#050d1a] flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,94,120,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(12,80,110,0.45),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(7,28,48,0.8),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.1),rgba(4,8,16,0.95))]" />
        </div>

        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="YakGo"
              width={200}
              height={200}
              priority
              className="w-[52vw] max-w-[300px] h-auto drop-shadow-[0_0_60px_rgba(0,150,255,0.45)] animate-pulse"
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
