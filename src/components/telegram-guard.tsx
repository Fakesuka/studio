'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Delay to ensure Telegram SDK is loaded
    const timer = setTimeout(() => {
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);
      setIsChecking(false);

      // Log for debugging
      console.log('Telegram WebApp check:', {
        isTelegramWebApp: isTg,
        telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
        webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
        initData: typeof window !== 'undefined' && window.Telegram?.WebApp?.initData,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking - full screen background image
  if (isChecking) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image - full screen */}
        <Image
          src="/BCKDARK.PNG"
          alt="YakGo"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Welcome text below YakGo logo area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mt-32 text-center">
            <p className="text-white/70 text-lg font-medium animate-pulse">Добро пожаловать</p>
          </div>
        </div>
      </div>
    );
  }

  // If not Telegram, show warning with background
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image - full screen */}
        <Image
          src="/BCKDARK.PNG"
          alt="YakGo"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="mt-24 text-center max-w-sm">
            <p className="text-white/70 text-base mb-6">Добро пожаловать</p>
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <p className="text-white font-medium mb-2">Доступ ограничен</p>
              <p className="text-white/60 text-sm mb-4">
                Приложение работает только в Telegram
              </p>
              <a
                href="https://t.me/yaktgo_bot"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#22D3EE] hover:bg-[#22D3EE]/80 text-black font-medium rounded-xl transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть в Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Telegram, render children
  return <>{children}</>;
}
