'use client';

import { useEffect, useState, useMemo } from 'react';
import { isTelegramWebApp, getTelegramUser, getTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

// Генератор частиц для эффекта северного сияния
const AuroraParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
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

// Снежинки
const Snowflakes = () => {
  const flakes = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 3 + Math.random() * 5,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute snowflake text-white/40"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

// Пульсирующие круги вокруг логотипа
const PulseRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="absolute w-32 h-32 rounded-full border border-cyan-400/30 animate-ping-slow" />
    <div className="absolute w-48 h-48 rounded-full border border-purple-500/20 animate-ping-slower" />
    <div className="absolute w-64 h-64 rounded-full border border-cyan-400/10 animate-ping-slowest" />
  </div>
);

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
  const [isDark, setIsDark] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Get theme from Telegram
    const webApp = getTelegramWebApp();
    if (webApp?.colorScheme) {
      setIsDark(webApp.colorScheme === 'dark');
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
      <div className={`loading-screen min-h-screen w-full relative overflow-hidden bg-[#0A0D1F] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Aurora Background Image */}
        <div className="absolute inset-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt="Aurora"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0D1F]/30 to-[#0A0D1F]/80" />
        </div>

        {/* Aurora Particles Effect */}
        <AuroraParticles />

        {/* Snowflakes */}
        <Snowflakes />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Pulse Rings behind logo */}
          <div className="relative">
            <PulseRings />

            {/* Logo Container */}
            <div className="relative z-10 logo-container">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-cyan-500/40 via-purple-500/30 to-cyan-500/40 animate-pulse-glow" />

              {/* Main Logo */}
              <div className="relative glass-logo rounded-3xl p-8 border border-white/20">
                <h1 className="text-6xl font-bold tracking-wider logo-text">
                  <span className="text-white">ЯК</span>
                  <span className="text-cyan-400">GO</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-6 text-center tagline-appear">
            <p className="text-white/60 text-sm tracking-[0.3em] uppercase font-light">
              Автосервисы Якутии
            </p>
          </div>

          {/* Greeting (personalized if available) */}
          {userName && (
            <div className="mt-4 greeting-appear">
              <p className="text-cyan-400/80 text-base font-medium">
                Добро пожаловать, {userName}!
              </p>
            </div>
          )}

          {/* Loading Section */}
          <div className="mt-12 w-72 loading-section-appear">
            {/* Stage Text */}
            <p className="text-white/50 text-xs text-center mb-3 h-4 transition-all duration-300">
              {loadingStages[stageIndex]}
            </p>

            {/* Progress Bar */}
            <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              {/* Progress fill */}
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #22D3EE 0%, #A855F7 50%, #22D3EE 100%)',
                  backgroundSize: '200% 100%',
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
              </div>
            </div>

            {/* Progress percentage */}
            <p className="text-cyan-400/60 text-[10px] text-center mt-2 font-mono">
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
            <span>AURORA</span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>

        <style jsx>{`
          .glass-logo {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            box-shadow:
              0 0 60px rgba(34, 211, 238, 0.2),
              0 0 100px rgba(168, 85, 247, 0.1),
              inset 0 0 60px rgba(255, 255, 255, 0.05);
          }

          .logo-text {
            text-shadow:
              0 0 20px rgba(34, 211, 238, 0.5),
              0 0 40px rgba(34, 211, 238, 0.3),
              0 0 60px rgba(168, 85, 247, 0.2);
          }

          .logo-container {
            animation: logo-appear 1s ease-out forwards;
          }

          .tagline-appear {
            opacity: 0;
            animation: fade-up 0.8s ease-out 0.3s forwards;
          }

          .greeting-appear {
            opacity: 0;
            animation: fade-up 0.8s ease-out 0.5s forwards;
          }

          .loading-section-appear {
            opacity: 0;
            animation: fade-up 0.8s ease-out 0.7s forwards;
          }

          @keyframes logo-appear {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes fade-up {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }

          :global(.aurora-particle) {
            animation: float-up linear infinite;
          }

          @keyframes float-up {
            0% {
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-20vh) scale(1);
              opacity: 0;
            }
          }

          :global(.snowflake) {
            animation: snow-fall linear infinite;
          }

          @keyframes snow-fall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }

          :global(.animate-ping-slow) {
            animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          :global(.animate-ping-slower) {
            animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
            animation-delay: 0.5s;
          }

          :global(.animate-ping-slowest) {
            animation: ping-slow 5s cubic-bezier(0, 0, 0.2, 1) infinite;
            animation-delay: 1s;
          }

          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.5);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
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
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0D1F] flex flex-col items-center justify-center">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt="Aurora"
            fill
            className="object-cover object-center opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-[#0A0D1F]/60" />
        </div>

        {/* Aurora Particles */}
        <AuroraParticles />

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold tracking-wider">
              <span className="text-white">ЯК</span>
              <span className="text-cyan-400">GO</span>
            </h1>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-2">
              Автосервисы Якутии
            </p>
          </div>

          {/* Warning Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-400/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2">Доступ ограничен</p>
            <p className="text-white/50 text-sm mb-6">
              Приложение работает только внутри Telegram
            </p>
            <a
              href="https://t.me/yaktgo_bot"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
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
