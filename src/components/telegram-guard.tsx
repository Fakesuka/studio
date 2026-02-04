'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

// SVG контур карты Якутии (упрощённый)
const YakutiaMapSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full">
    {/* Контур карты Якутии */}
    <path
      d="M 80 180
         C 60 160, 50 140, 60 120
         C 70 100, 90 80, 120 70
         C 150 60, 180 50, 220 55
         C 260 60, 290 70, 320 90
         C 340 100, 355 120, 360 150
         C 365 180, 350 210, 330 230
         C 310 250, 280 260, 240 255
         C 200 250, 160 240, 130 220
         C 100 200, 90 190, 80 180 Z"
      fill="rgba(255, 255, 255, 0.05)"
      stroke="rgba(255, 255, 255, 0.4)"
      strokeWidth="2"
      className="yakutia-outline"
    />

    {/* Анимированный маршрут */}
    <path
      d="M 90 170 Q 150 100 200 130 T 300 120 T 340 160"
      fill="none"
      stroke="rgba(128, 255, 255, 0.8)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="500"
      strokeDashoffset="500"
      className="route-path"
    />

    {/* Точки на маршруте */}
    <g className="route-points">
      <circle cx="90" cy="170" r="6" fill="#80FFFF" className="point point-1" />
      <circle cx="150" cy="115" r="4" fill="#80FFFF" className="point point-2" />
      <circle cx="200" cy="130" r="4" fill="#80FFFF" className="point point-3" />
      <circle cx="260" cy="105" r="4" fill="#80FFFF" className="point point-4" />
      <circle cx="300" cy="120" r="4" fill="#80FFFF" className="point point-5" />
      <circle cx="340" cy="160" r="6" fill="#80FFFF" className="point point-6">
        <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Иконки машинок на маршруте */}
    <g className="cars">
      <text x="130" y="125" fontSize="12" className="car car-1">🚗</text>
      <text x="180" y="115" fontSize="12" className="car car-2">🚗</text>
      <text x="230" y="108" fontSize="12" className="car car-3">🚗</text>
      <text x="280" y="118" fontSize="12" className="car car-4">🚗</text>
    </g>
  </svg>
);

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Get theme from Telegram
    const webApp = getTelegramWebApp();
    if (webApp?.colorScheme) {
      setIsDark(webApp.colorScheme === 'dark');
    }

    // Check if Telegram
    const isTg = isTelegramWebApp();
    setIsTelegram(isTg);

    // Log for debugging
    console.log('Telegram WebApp check:', {
      isTelegramWebApp: isTg,
      telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
      webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      initData: typeof window !== 'undefined' && window.Telegram?.WebApp?.initData,
    });

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Hide welcome after animation completes
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Show welcome/loading screen
  if (showWelcome || isTelegram === null) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0D1F] flex flex-col items-center justify-center">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt="Aurora"
            fill
            className="object-cover object-center opacity-90"
            priority
          />
        </div>

        {/* Glass Card with Map */}
        <div className="relative z-10 w-[85%] max-w-md aspect-[1.5] glass-card-map rounded-3xl border border-white/20 overflow-hidden backdrop-blur-sm bg-white/5 animate-scale-in">
          {/* Yakutia Map with Routes */}
          <YakutiaMapSVG />

          {/* Loading indicator inside card */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%]">
            <p className="text-white/80 text-sm text-center mb-2 font-medium">
              Загрузка маршрутов...
            </p>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10 mt-8 text-center animate-fade-in-up">
          <h1 className="text-5xl font-bold text-white tracking-wider aurora-text">
            АВРОРА<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-white/70 text-lg mt-2 tracking-widest font-light">
            АВТОСЕРВИСЫ ЯКУТИИ
          </p>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg" />

        <style jsx>{`
          .glass-card-map {
            box-shadow:
              0 0 60px rgba(128, 255, 255, 0.15),
              inset 0 0 60px rgba(128, 255, 255, 0.05);
          }

          .aurora-text {
            text-shadow: 0 0 40px rgba(128, 255, 255, 0.5);
          }

          @keyframes scale-in {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-scale-in {
            animation: scale-in 0.8s ease-out forwards;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out 0.3s forwards;
            opacity: 0;
          }

          :global(.route-path) {
            animation: draw-route 2s ease-in-out forwards;
          }

          @keyframes draw-route {
            to {
              stroke-dashoffset: 0;
            }
          }

          :global(.point) {
            opacity: 0;
            animation: point-appear 0.3s ease-out forwards;
          }

          :global(.point-1) { animation-delay: 0.3s; }
          :global(.point-2) { animation-delay: 0.6s; }
          :global(.point-3) { animation-delay: 0.9s; }
          :global(.point-4) { animation-delay: 1.2s; }
          :global(.point-5) { animation-delay: 1.5s; }
          :global(.point-6) { animation-delay: 1.8s; }

          @keyframes point-appear {
            to {
              opacity: 1;
            }
          }

          :global(.car) {
            opacity: 0;
            animation: car-appear 0.4s ease-out forwards;
          }

          :global(.car-1) { animation-delay: 0.5s; }
          :global(.car-2) { animation-delay: 0.8s; }
          :global(.car-3) { animation-delay: 1.1s; }
          :global(.car-4) { animation-delay: 1.4s; }

          @keyframes car-appear {
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // If not Telegram, show warning with background
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0D1F] flex flex-col items-center justify-center">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt="Aurora"
            fill
            className="object-cover object-center opacity-90"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm p-6">
          <h1 className="text-4xl font-bold text-white tracking-wider mb-8">
            АВРОРА<span className="text-cyan-400">.</span>
          </h1>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <p className="text-white font-semibold text-lg mb-2">Доступ ограничен</p>
            <p className="text-white/70 text-sm mb-5">
              Приложение работает только в Telegram
            </p>
            <a
              href="https://t.me/yaktgo_bot"
              className="inline-flex items-center justify-center px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg" />
      </div>
    );
  }

  // If Telegram, render children
  return <>{children}</>;
}
