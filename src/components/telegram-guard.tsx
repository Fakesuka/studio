'use client';

import { useEffect, useState, useMemo } from 'react';
import { isTelegramWebApp, getTelegramUser, getTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

// Частицы северного сияния
const AuroraParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.4,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full aurora-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.id % 3 === 0
              ? '#22D3EE'
              : p.id % 3 === 1
                ? '#A855F7'
                : '#818CF8',
            boxShadow: `0 0 ${p.size * 2}px ${p.id % 3 === 0 ? '#22D3EE' : '#A855F7'}`,
          }}
        />
      ))}
    </div>
  );
};

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

        {/* Subtle aurora particles */}
        <AuroraParticles />

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

          {/* Logo image - large, no glow/shimmer */}
          <div className="logo-appear">
            <Image
              src="/logo.png"
              alt="YakGo"
              width={280}
              height={280}
              className="object-contain"
              priority
            />
          </div>

          {/* YAKGO text */}
          <h1 className="text-4xl font-bold tracking-[0.25em] text-white mt-2 text-appear-1">
            YAKGO
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-sm tracking-[0.2em] uppercase mt-2 text-appear-2">
            Автосервисы Якутии
          </p>

          {/* Greeting */}
          {userName && (
            <p className="text-cyan-400/70 text-sm font-medium mt-4 text-appear-2">
              Добро пожаловать, {userName}!
            </p>
          )}

          {/* Loading section */}
          <div className="mt-10 w-64 text-appear-3">
            {/* Stage text */}
            <p className="text-white/40 text-xs text-center mb-3 transition-all duration-300">
              {loadingStages[stageIndex]}
            </p>

            {/* Progress bar */}
            <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3B82F6 0%, #A855F7 100%)',
                }}
              />
            </div>

            {/* Percentage */}
            <p className="text-white/30 text-[10px] text-center mt-2 font-mono">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .text-appear-2 {
            opacity: 0;
            animation: fade-up 0.6s ease-out 0.4s forwards;
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

  // Not in Telegram
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#080B18] flex flex-col items-center justify-center">
        <AuroraParticles />

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
            Автосервисы Якутии
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
