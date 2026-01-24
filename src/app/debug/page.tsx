'use client';

import { useEffect, useState } from 'react';
import { getTelegramWebApp, getTelegramUser, isTelegramWebApp } from '@/lib/telegram';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const info = {
      isTelegramWebApp: isTelegramWebApp(),
      telegramAvailable: typeof window !== 'undefined' && !!window.Telegram,
      webAppAvailable: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      initData: '',
      user: null,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    };

    if (isTelegramWebApp()) {
      const webApp = getTelegramWebApp();
      const user = getTelegramUser();

      info.initData = webApp?.initData || 'EMPTY';
      info.user = user;
    }

    setDebugInfo(info);
  }, []);

  if (!debugInfo) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Information</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Telegram WebApp Status:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              isTelegramWebApp: debugInfo.isTelegramWebApp,
              telegramAvailable: debugInfo.telegramAvailable,
              webAppAvailable: debugInfo.webAppAvailable,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">API URL:</h2>
          <pre className="text-sm overflow-auto">{debugInfo.apiUrl}</pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Init Data:</h2>
          <pre className="text-sm overflow-auto break-all">
            {debugInfo.initData.substring(0, 200)}...
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">User Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">
          <h2 className="font-bold mb-2">⚠️ Важно:</h2>
          <ul className="list-disc ml-5 space-y-2">
            <li>Если <code>isTelegramWebApp: false</code> - вы открыли приложение в обычном браузере, а не через Telegram бота</li>
            <li>Если <code>user: null</code> - Telegram не передал данные пользователя</li>
            <li>Если <code>API URL: NOT SET</code> - не настроена переменная NEXT_PUBLIC_API_URL на Vercel</li>
          </ul>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
          <h2 className="font-bold mb-2">✅ Как исправить:</h2>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Откройте Telegram</li>
            <li>Найдите бота <strong>@yaktgo_bot</strong></li>
            <li>Отправьте команду <code>/start</code></li>
            <li>Нажмите кнопку <strong>"🚀 Открыть YakGo"</strong></li>
            <li>Затем откройте эту страницу: <code>/debug</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
