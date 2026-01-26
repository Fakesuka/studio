'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getTelegramWebApp, getTelegramUser, getTelegramInitData } from '@/lib/telegram';

export default function TestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runInitialTests();
  }, []);

  const runInitialTests = async () => {
    const testResults: any = {
      timestamp: new Date().toISOString(),
      frontend: {},
      telegram: {},
      backend: {},
    };

    // Frontend tests
    testResults.frontend.url = window.location.href;
    testResults.frontend.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'not set';
    testResults.frontend.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'not set';

    // Telegram tests
    const webApp = getTelegramWebApp();
    testResults.telegram.available = !!webApp;
    if (webApp) {
      testResults.telegram.version = webApp.version;
      testResults.telegram.platform = webApp.platform;
      testResults.telegram.user = getTelegramUser();
      testResults.telegram.hasInitData = !!getTelegramInitData();
      testResults.telegram.initDataLength = getTelegramInitData()?.length || 0;
    }

    setResults(testResults);
  };

  const testBackendHealth = async () => {
    setLoading(true);
    try {
      console.log('[Test] Testing backend health...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();

      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          health: { success: true, data },
        },
      }));
    } catch (error) {
      console.error('[Test] Backend health check failed:', error);
      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          health: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testProfileAPI = async () => {
    setLoading(true);
    try {
      console.log('[Test] Testing profile API...');
      const profile = await api.getProfile();
      console.log('[Test] Profile loaded:', profile);

      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          profile: { success: true, data: profile },
        },
      }));
    } catch (error) {
      console.error('[Test] Profile API failed:', error);
      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          profile: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    setLoading(true);
    try {
      console.log('[Test] Testing update profile...');
      const testData = {
        name: 'Test User',
        phone: '+79991234567',
        city: 'Якутск',
      };
      const result = await api.updateProfile(testData);
      console.log('[Test] Profile updated:', result);

      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          updateProfile: { success: true, data: result },
        },
      }));
    } catch (error) {
      console.error('[Test] Update profile failed:', error);
      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          updateProfile: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testDriverRegistration = async () => {
    setLoading(true);
    try {
      console.log('[Test] Testing driver registration...');
      const testData = {
        name: 'Test Driver',
        vehicle: 'Toyota Camry',
        services: ['Отогрев авто', 'Доставка топлива'],
        legalStatus: 'Самозанятый' as const,
      };
      const result = await api.registerAsDriver(testData);
      console.log('[Test] Driver registered:', result);

      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          driverRegistration: { success: true, data: result },
        },
      }));
    } catch (error) {
      console.error('[Test] Driver registration failed:', error);
      setResults((prev: any) => ({
        ...prev,
        backend: {
          ...prev.backend,
          driverRegistration: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>YakGo System Test</CardTitle>
          <CardDescription>
            Проверка подключения frontend → backend → database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Test Controls:</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={testBackendHealth} disabled={loading}>
                Test Backend Health
              </Button>
              <Button onClick={testProfileAPI} disabled={loading}>
                Test Get Profile
              </Button>
              <Button onClick={testUpdateProfile} disabled={loading}>
                Test Update Profile
              </Button>
              <Button onClick={testDriverRegistration} disabled={loading}>
                Test Driver Registration
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Quick Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className={`p-3 rounded ${results.frontend?.apiUrl !== 'not set' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <div className="font-medium">Frontend Config</div>
                <div className="text-sm">
                  {results.frontend?.apiUrl !== 'not set' ? '✅ Configured' : '❌ Not configured'}
                </div>
              </div>

              <div className={`p-3 rounded ${results.telegram?.available ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <div className="font-medium">Telegram WebApp</div>
                <div className="text-sm">
                  {results.telegram?.available ? '✅ Available' : '❌ Not available'}
                </div>
              </div>

              <div className={`p-3 rounded ${results.backend?.health?.success ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <div className="font-medium">Backend Connection</div>
                <div className="text-sm">
                  {results.backend?.health?.success ? '✅ Connected' : results.backend?.health ? '❌ Failed' : '⏳ Not tested'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>💡 Откройте консоль браузера (F12) для детальных логов</p>
            <p>💡 Все запросы логируются с префиксом [API], [Auth], [Profile]</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
