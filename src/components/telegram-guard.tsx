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

// Generate neon particles with guaranteed spread across screen zones
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const cols = 5;
    const rows = 5;
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const left = (col / cols) * 100 + Math.random() * (100 / cols);
    const top = (row / rows) * 100 + Math.random() * (100 / rows);

    return {
      id: i,
      left: Math.min(left, 98),
      top: Math.min(top, 98),
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.5 + 0.15,
      x1: (Math.random() - 0.5) * 80,
      y1: (Math.random() - 0.5) * 80,
      x2: (Math.random() - 0.5) * 100,
      y2: (Math.random() - 0.5) * 100,
      x3: (Math.random() - 0.5) * 60,
      y3: (Math.random() - 0.5) * 60,
      color: i % 3 === 0
        ? 'rgba(34,211,238,0.9)'
        : i % 3 === 1
          ? 'rgba(168,85,247,0.7)'
          : 'rgba(0,150,255,0.8)',
      glow: i % 3 === 0
        ? 'rgba(34,211,238,0.6)'
        : i % 3 === 1
          ? 'rgba(168,85,247,0.5)'
          : 'rgba(0,100,255,0.5)',
    };
  });
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

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = prev < 30 ? 3 : prev < 70 ? 2 : prev < 90 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    // Loading stages
    const stageInterval = setInterval(() => {
      setStageIndex(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 800);

    // Fade out transition
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

  // Welcome / Loading screen
  if (showWelcome || isTelegram === null) {
    return (
      <div className={`min-h-screen w-full relative overflow-hidden bg-[#080B18] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>

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
                background: `radial-gradient(circle, ${p.color}, transparent)`,
                boxShadow: `0 0 ${p.size * 3}px ${p.glow}, 0 0 ${p.size * 6}px ${p.glow}`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                ['--x1' as string]: `${p.x1}px`,
                ['--y1' as string]: `${p.y1}px`,
                ['--x2' as string]: `${p.x2}px`,
                ['--y2' as string]: `${p.y2}px`,
                ['--x3' as string]: `${p.x3}px`,
                ['--y3' as string]: `${p.y3}px`,
                ['--p-opacity' as string]: p.opacity,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 w-full">
          <Image
            src="/logo.png"
            alt="YakGo"
            width={480}
            height={480}
            className="w-[75vw] max-w-[480px] h-auto drop-shadow-[0_0_60px_rgba(0,150,255,0.3)]"
            priority
          />

          <h1 className="text-4xl font-bold tracking-[0.25em] text-white mt-2">
            YAKGO
          </h1>

          <p className="text-white/50 text-sm mt-2">
            Ваш надёжный помощник на дорогах Якутии
          </p>

          {userName && (
            <p className="text-cyan-400/70 text-sm font-medium mt-4">
              Добро пожаловать, {userName}!
            </p>
          )}

          <div className="mt-10 w-64">
            <p className="text-white/40 text-xs text-center mb-3 transition-all duration-300">
              {loadingStages[stageIndex]}
            </p>

            <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3B82F6 0%, #A855F7 100%)',
                }}
              />
            </div>

            <p className="text-white/30 text-[10px] text-center mt-2 font-mono">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes neon-float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: var(--p-opacity, 0.3);
            }
            20% {
              transform: translate(var(--x1), var(--y1)) scale(1.2);
              opacity: calc(var(--p-opacity, 0.3) * 1.4);
            }
            40% {
              transform: translate(var(--x2), var(--y2)) scale(0.7);
              opacity: calc(var(--p-opacity, 0.3) * 0.5);
            }
            60% {
              transform: translate(var(--x3), var(--y3)) scale(1.3);
              opacity: var(--p-opacity, 0.3);
            }
            80% {
              transform: translate(calc(var(--x1) * -0.6), calc(var(--y2) * -0.4)) scale(0.9);
              opacity: calc(var(--p-opacity, 0.3) * 1.2);
            }
          }

          .neon-particle {
            animation: neon-float ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Not in Telegram
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#080B18] flex flex-col items-center justify-center">
        <div className="relative z-10 text-center max-w-sm p-6">
          <Image
            src="/logo.png"
            alt="YakGo"
            width={180}
            height={180}
            className="object-contain mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white mb-1">
            YAKGO
          </h1>
          <p className="text-white/40 text-xs tracking-[0.15em] uppercase mb-8">
            Ваш надёжный помощник на дорогах Якутии
          </p>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-400/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  return <>{children}</>;
}
