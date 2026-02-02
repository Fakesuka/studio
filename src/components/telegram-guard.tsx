'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp } from '@/lib/telegram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  // Show loading while checking - with background image
  if (isChecking) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/10 via-transparent to-neon-purple/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <p className="text-white/80 text-lg font-medium mb-6 animate-pulse">Добро пожаловать</p>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-cyan"></div>
        </div>
      </div>
    );
  }

  // If not Telegram, show warning - with background image
  if (!isTelegram) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={isDark ? "/BCKDARK.PNG" : "/BCKWHITE.PNG"}
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/10 via-transparent to-neon-purple/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <p className="text-white text-xl font-medium mb-8">Добро пожаловать в YakGo</p>
          <Card className="max-w-md w-full bg-black/60 border-white/10 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <CardTitle className="text-white text-lg">Доступ ограничен</CardTitle>
              <CardDescription className="text-gray-400">
                Это приложение работает только в Telegram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-neon-cyan/10 p-4 rounded-xl border border-neon-cyan/20">
                <h3 className="font-semibold mb-2 text-neon-cyan text-sm">
                  Как открыть приложение:
                </h3>
                <ol className="list-decimal ml-5 space-y-1.5 text-sm text-gray-300">
                  <li>Откройте <strong className="text-white">Telegram</strong></li>
                  <li>Найдите бота <strong className="text-white">@yaktgo_bot</strong></li>
                  <li>Отправьте команду <code className="bg-black/40 px-1.5 py-0.5 rounded text-neon-cyan">/start</code></li>
                  <li>Нажмите кнопку <strong className="text-white">&quot;Открыть YakGo&quot;</strong></li>
                </ol>
              </div>

              <div className="text-center pt-2">
                <a
                  href="https://t.me/yaktgo_bot"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-medium rounded-xl transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть в Telegram
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If Telegram, render children
  return <>{children}</>;
}
