'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getTelegramWebApp, getTelegramUser, getTelegramInitData } from '@/lib/telegram';

export default function DiagnosticPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testEnvironment = () => {
    clearLogs();
    addLog('=== Проверка окружения ===');
    addLog(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'НЕ НАСТРОЕН'}`);
    addLog(`WS URL: ${process.env.NEXT_PUBLIC_WS_URL || 'НЕ НАСТРОЕН'}`);
    addLog(`Bot Username: ${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'НЕ НАСТРОЕН'}`);
    addLog('');

    const webApp = getTelegramWebApp();
    addLog(`Telegram WebApp: ${webApp ? '✅ Доступен' : '❌ Недоступен'}`);

    if (webApp) {
      addLog(`Version: ${webApp.version}`);
      addLog(`Platform: ${webApp.platform}`);

      const user = getTelegramUser();
      addLog(`User: ${user ? JSON.stringify(user, null, 2) : '❌ Нет данных'}`);

      const initData = getTelegramInitData();
      addLog(`Init Data Length: ${initData?.length || 0}`);
      addLog(`Has Init Data: ${!!initData ? '✅ Да' : '❌ Нет'}`);
    }
  };

  const testBackendDirect = async () => {
    setLoading(true);
    addLog('');
    addLog('=== Прямой тест Backend ===');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      addLog(`Testing: ${apiUrl}/health`);

      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();

      addLog(`✅ Status: ${response.status}`);
      addLog(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfileAPI = async () => {
    setLoading(true);
    addLog('');
    addLog('=== Тест Profile API ===');

    try {
      addLog('Calling api.getProfile()...');
      const profile = await api.getProfile();
      addLog(`✅ Success!`);
      addLog(`Profile: ${JSON.stringify(profile, null, 2)}`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    setLoading(true);
    addLog('');
    addLog('=== Тест Update Profile ===');

    try {
      const testData = {
        name: 'Test User ' + Date.now(),
        phone: '+79991234567',
        city: 'Якутск',
      };

      addLog(`Sending data: ${JSON.stringify(testData, null, 2)}`);
      const result = await api.updateProfile(testData);
      addLog(`✅ Success!`);
      addLog(`Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      addLog(`Error stack: ${error instanceof Error ? error.stack : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const testDriverRegistration = async () => {
    setLoading(true);
    addLog('');
    addLog('=== Тест Driver Registration ===');

    try {
      const testData = {
        name: 'Test Driver',
        vehicle: 'Toyota Camry',
        services: ['Отогрев авто'],
        legalStatus: 'Самозанятый',
      };

      addLog(`Sending data: ${JSON.stringify(testData, null, 2)}`);
      const result = await api.registerAsDriver(testData);
      addLog(`✅ Success!`);
      addLog(`Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Диагностика YakGo</CardTitle>
          <CardDescription>
            Детальная проверка всех компонентов системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Тесты:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testEnvironment} disabled={loading} variant="outline">
                Проверить окружение
              </Button>
              <Button onClick={testBackendDirect} disabled={loading} variant="outline">
                Тест Backend /health
              </Button>
              <Button onClick={testProfileAPI} disabled={loading} variant="outline">
                Тест Get Profile
              </Button>
              <Button onClick={testUpdateProfile} disabled={loading} variant="outline">
                Тест Update Profile
              </Button>
              <Button onClick={testDriverRegistration} disabled={loading} variant="outline">
                Тест Driver Registration
              </Button>
              <Button onClick={clearLogs} variant="destructive">
                Очистить логи
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Логи:</h3>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
              {logs.length === 0 ? (
                <div className="text-gray-500">Нажмите кнопку для начала тестирования...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))
              )}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">💡 Инструкции:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Начните с "Проверить окружение" - проверит переменные</li>
              <li>"Тест Backend /health" - проверит что backend отвечает</li>
              <li>"Тест Get Profile" - проверит что API работает</li>
              <li>"Тест Update Profile" - проверит сохранение данных</li>
              <li>Скопируйте логи если нужна помощь</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
