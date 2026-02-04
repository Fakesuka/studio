'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp, getTelegramUser, getTelegramWebApp } from '@/lib/telegram';
import Image from 'next/image';

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isDark, setIsDark] = useState(true);

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

    // Log for debugging
    console.log('Telegram WebApp check:', {
      isTelegramWebApp: isTg,
      telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
      webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      initData: typeof window !== 'undefined' && window.Telegram?.WebApp?.initData,
    });

    // Add 2 second delay for welcome screen
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show welcome screen with background
  if (showWelcome || isTelegram === null) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0f1a]">
        {/* Background Image - full screen */}
        <Image
          src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
          alt="YakGo"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Personalized greeting below YakGo logo area */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-32">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/10">
            <p className="text-white text-lg font-medium text-center">
              {userName ? `С возвращением, ${userName}!` : 'Добро пожаловать!'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not Telegram, show warning with background
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0f1a]">
        {/* Background Image - full screen */}
        <Image
          src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
          alt="YakGo"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 p-6">
          <div className="text-center max-w-sm">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <p className="text-white font-semibold text-lg mb-2">Доступ ограничен</p>
              <p className="text-white/70 text-sm mb-5">
                Приложение работает только в Telegram
              </p>
              <a
                href="https://t.me/yaktgo_bot"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#22D3EE] hover:bg-[#22D3EE]/80 text-black font-semibold rounded-xl transition-colors"
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
