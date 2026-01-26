'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConnectionTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testConnection = async () => {
    clearLogs();
    setLoading(true);

    try {
      // Тест 1: Проверяем переменные окружения
      addLog('=== ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ===');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

      addLog(`NEXT_PUBLIC_API_URL: ${apiUrl || 'НЕ НАСТРОЕН ❌'}`);
      addLog(`NEXT_PUBLIC_WS_URL: ${wsUrl || 'НЕ НАСТРОЕН ❌'}`);
      addLog('');

      if (!apiUrl) {
        addLog('❌ КРИТИЧЕСКАЯ ОШИБКА: API_URL не настроен!');
        addLog('Откройте Vercel Dashboard → Settings → Environment Variables');
        addLog('Добавьте: NEXT_PUBLIC_API_URL = https://gregarious-laughter-production.up.railway.app/api');
        return;
      }

      // Тест 2: Проверяем backend health endpoint
      addLog('=== ПРОВЕРКА BACKEND ===');
      const backendUrl = apiUrl.replace('/api', '');
      addLog(`Backend URL: ${backendUrl}`);
      addLog(`Пытаемся подключиться к ${backendUrl}/health...`);
      addLog('');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const healthResponse = await fetch(`${backendUrl}/health`, {
          signal: controller.signal,
          mode: 'cors',
          credentials: 'include',
        });

        clearTimeout(timeoutId);

        addLog(`✅ Backend ответил! HTTP ${healthResponse.status}`);
        addLog(`Response OK: ${healthResponse.ok}`);
        addLog(`Status Text: ${healthResponse.statusText}`);

        // Показываем заголовки ответа
        const headers: Record<string, string> = {};
        healthResponse.headers.forEach((value, key) => {
          headers[key] = value;
        });
        addLog(`Headers: ${JSON.stringify(headers, null, 2)}`);
        addLog('');

        if (healthResponse.ok) {
          const data = await healthResponse.json();
          addLog('✅ Backend данные:');
          addLog(JSON.stringify(data, null, 2));
        } else {
          addLog(`❌ Backend вернул ошибку: ${healthResponse.status}`);
          const errorText = await healthResponse.text();
          addLog(`Error: ${errorText}`);
        }
      } catch (fetchError: any) {
        addLog('❌ Не удалось подключиться к backend!');
        addLog(`Error name: ${fetchError.name}`);
        addLog(`Error message: ${fetchError.message}`);

        if (fetchError.name === 'AbortError') {
          addLog('Таймаут: Backend не ответил за 10 секунд');
        } else if (fetchError.message.includes('Failed to fetch')) {
          addLog('');
          addLog('ПРИЧИНЫ "Failed to fetch":');
          addLog('1. Backend не запущен - проверьте Railway Dashboard');
          addLog('2. Неправильный URL в NEXT_PUBLIC_API_URL');
          addLog('3. CORS блокирует запрос - проверьте FRONTEND_URL в Railway');
          addLog('4. Backend недоступен из-за сетевой проблемы');
          addLog('');
          addLog('ЧТО ПРОВЕРИТЬ:');
          addLog('• Railway: https://railway.app/dashboard → ваш проект → backend service');
          addLog('• Статус должен быть "Active" (зеленый)');
          addLog('• В Variables проверьте FRONTEND_URL = https://studio-black-sigma.vercel.app');
          addLog('• В логах Railway не должно быть ошибок');
        } else if (fetchError.message.includes('CORS')) {
          addLog('');
          addLog('CORS ОШИБКА:');
          addLog('Backend блокирует запросы от фронтенда');
          addLog('Решение: В Railway установите FRONTEND_URL = https://studio-black-sigma.vercel.app');
        }
      }

      addLog('');
      addLog('=== ПРОВЕРКА API ENDPOINT ===');
      addLog(`Пытаемся подключиться к ${apiUrl}/users/profile...`);

      try {
        const profileResponse = await fetch(`${apiUrl}/users/profile`, {
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        addLog(`HTTP ${profileResponse.status}: ${profileResponse.statusText}`);

        if (profileResponse.status === 401) {
          addLog('✅ Backend доступен! (401 ожидаем, нет Telegram auth)');
        } else if (profileResponse.ok) {
          addLog('✅ Backend доступен и отвечает!');
          const data = await profileResponse.json();
          addLog(JSON.stringify(data, null, 2));
        } else {
          addLog(`⚠️ Backend доступен, но вернул: ${profileResponse.status}`);
        }
      } catch (apiError: any) {
        addLog(`❌ API endpoint недоступен: ${apiError.message}`);
      }

    } catch (error: any) {
      addLog(`❌ Неожиданная ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔌 Тест подключения к Backend</CardTitle>
          <CardDescription>
            Детальная диагностика подключения Frontend → Backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Проверка...' : '🔍 Запустить проверку'}
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              disabled={loading}
            >
              Очистить
            </Button>
          </div>

          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
            {logs.length === 0 ? (
              <div className="text-gray-500">
                Нажмите "Запустить проверку" для диагностики подключения...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">📋 Быстрая проверка:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Vercel: переменные окружения настроены?</li>
              <li>Railway: backend сервис запущен (Active)?</li>
              <li>Railway: FRONTEND_URL указывает на Vercel?</li>
              <li>Backend: /health endpoint отвечает?</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
