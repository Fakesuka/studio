'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp } from '@/lib/telegram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Small delay to ensure Telegram SDK is loaded
    const timer = setTimeout(() => {
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);
      setIsChecking(false);

      // Log for debugging
      console.log('Telegram WebApp check:', {
        isTelegramWebApp: isTg,
        telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
        webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // If not Telegram, show warning
  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle>Доступ ограничен</CardTitle>
            <CardDescription>
              Это приложение работает только в Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Как открыть приложение:
              </h3>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>Откройте <strong>Telegram</strong></li>
                <li>Найдите бота <strong>@yaktgo_bot</strong></li>
                <li>Отправьте команду <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/start</code></li>
                <li>Нажмите кнопку <strong>"🚀 Открыть YakGo"</strong></li>
              </ol>
            </div>

            <div className="text-center pt-4">
              <a
                href="https://t.me/yaktgo_bot"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть в Telegram
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Telegram, render children
  return <>{children}</>;
}
