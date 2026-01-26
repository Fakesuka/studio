'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Save to localStorage for debug page
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to save error to localStorage:', e);
    }

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Произошла ошибка
              </CardTitle>
              <CardDescription>
                Приложение столкнулось с неожиданной ошибкой
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4">
                <p className="font-mono text-sm text-destructive">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>

              {this.state.error?.stack && (
                <details className="rounded-md bg-muted p-4">
                  <summary className="cursor-pointer font-medium">
                    Технические детали (Stack Trace)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {this.state.errorInfo?.componentStack && (
                <details className="rounded-md bg-muted p-4">
                  <summary className="cursor-pointer font-medium">
                    Component Stack
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null });
                  }}
                >
                  Попробовать снова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/debug'}
                >
                  Просмотр всех ошибок
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Перезагрузить страницу
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
