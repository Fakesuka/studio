'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function GlobalErrorHandler() {
  const { toast } = useToast();

  useEffect(() => {
    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);

      // Save to localStorage
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push({
          timestamp: new Date().toISOString(),
          message: event.error?.message || event.message || 'Unknown error',
          stack: event.error?.stack || 'No stack trace',
          type: 'unhandled',
        });
        if (errors.length > 10) {
          errors.shift();
        }
        localStorage.setItem('app_errors', JSON.stringify(errors));
      } catch (e) {
        console.error('Failed to save error:', e);
      }

      // Show toast notification
      toast({
        variant: 'destructive',
        title: 'Ошибка приложения',
        description: event.error?.message || event.message || 'Произошла неизвестная ошибка',
        duration: 10000,
      });

      // Show alert in Telegram WebApp (since console might not be accessible)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setTimeout(() => {
          const errorMsg = `Ошибка: ${event.error?.message || event.message}\n\nПерейдите на страницу /debug для просмотра деталей`;
          window.Telegram.WebApp.showAlert(errorMsg);
        }, 500);
      }
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Save to localStorage
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push({
          timestamp: new Date().toISOString(),
          message: event.reason?.message || String(event.reason) || 'Promise rejection',
          stack: event.reason?.stack || 'No stack trace',
          type: 'promise_rejection',
        });
        if (errors.length > 10) {
          errors.shift();
        }
        localStorage.setItem('app_errors', JSON.stringify(errors));
      } catch (e) {
        console.error('Failed to save rejection:', e);
      }

      // Show toast notification
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки данных',
        description: event.reason?.message || String(event.reason) || 'Не удалось загрузить данные',
        duration: 10000,
      });

      // Show alert in Telegram WebApp
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setTimeout(() => {
          const errorMsg = `Ошибка загрузки: ${event.reason?.message || String(event.reason)}\n\nПерейдите на страницу /debug для просмотра деталей`;
          window.Telegram.WebApp.showAlert(errorMsg);
        }, 500);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [toast]);

  return null;
}
