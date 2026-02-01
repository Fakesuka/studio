'use client';

import { useEffect, useState } from 'react';
import { isTelegramWebApp } from '@/lib/telegram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function TelegramGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const [devMode, setDevMode] = useState(true);

  useEffect(() => {
    // Check for dev mode parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isDevMode = urlParams.get('devMode') === 'true' ||
      localStorage.getItem('devMode') === 'true' ||
      process.env.NODE_ENV === 'development';

    if (isDevMode) {
      localStorage.setItem('devMode', 'true');
      setDevMode(true);
    }

    // Delay to ensure Telegram SDK is loaded
    const timer = setTimeout(() => {
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);
      setIsChecking(false);

      // Log for debugging
      console.log('Telegram WebApp check:', {
        isTelegramWebApp: isTg,
        devMode: isDevMode,
        telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
        webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
        initData: typeof window !== 'undefined' && window.Telegram?.WebApp?.initData,
      });
    }, 300);

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

  // If dev mode, allow access without Telegram
  if (devMode) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-1 text-xs font-bold">
          🔧 DEV MODE - Работает без Telegram
        </div>
        <div className="pt-6">{children}</div>
      </>
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

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
              <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                🔧 Для разработчиков:
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Добавьте <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">?devMode=true</code> к URL для тестирования без Telegram
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('devMode', 'true');
                  window.location.reload();
                }}
                className="mt-2 text-sm bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
              >
                Включить Dev Mode
              </button>
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
