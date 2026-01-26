'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
}

export default function DebugPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadErrors();
  }, []);

  const loadErrors = () => {
    try {
      const stored = localStorage.getItem('app_errors');
      if (stored) {
        const parsed = JSON.parse(stored);
        setErrors(parsed.reverse()); // Show newest first
      }
    } catch (e) {
      console.error('Failed to load errors:', e);
    }
  };

  const clearErrors = () => {
    try {
      localStorage.removeItem('app_errors');
      setErrors([]);
    } catch (e) {
      console.error('Failed to clear errors:', e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => alert('Скопировано в буфер обмена!'),
      () => alert('Не удалось скопировать')
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Консоль отладки</h1>
          <p className="text-muted-foreground">
            Просмотр ошибок приложения без браузерной консоли
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadErrors}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearErrors}
            disabled={errors.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить
          </Button>
        </div>
      </div>

      {errors.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Нет записей об ошибках</p>
              <p className="text-sm text-muted-foreground">
                Все работает отлично! 🎉
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm">
              <strong>Всего ошибок:</strong> {errors.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Показываются последние 10 ошибок
            </p>
          </div>

          {errors.map((error, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Ошибка #{errors.length - index}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(error.timestamp), 'd MMMM yyyy, HH:mm:ss', {
                        locale: ru,
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Error</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-destructive/10 p-4">
                  <p className="mb-2 text-xs font-medium text-destructive">
                    Сообщение:
                  </p>
                  <p className="font-mono text-sm text-destructive">
                    {error.message}
                  </p>
                </div>

                {error.stack && (
                  <details className="rounded-md bg-muted p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Stack Trace (нажмите для раскрытия)
                    </summary>
                    <pre className="mt-2 overflow-auto text-xs">
                      {error.stack}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(error.stack || '')}
                    >
                      Копировать Stack Trace
                    </Button>
                  </details>
                )}

                {error.componentStack && (
                  <details className="rounded-md bg-muted p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Component Stack (нажмите для раскрытия)
                    </summary>
                    <pre className="mt-2 overflow-auto text-xs">
                      {error.componentStack}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        copyToClipboard(error.componentStack || '')
                      }
                    >
                      Копировать Component Stack
                    </Button>
                  </details>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const fullError = `
Время: ${error.timestamp}
Сообщение: ${error.message}

Stack Trace:
${error.stack || 'N/A'}

Component Stack:
${error.componentStack || 'N/A'}
                    `.trim();
                    copyToClipboard(fullError);
                  }}
                >
                  Копировать полную информацию об ошибке
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
