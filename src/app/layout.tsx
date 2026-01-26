import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import { RootProviders } from '@/components/root-providers';

import './globals.css';

// Используем системные шрифты вместо Google Fonts (для РФ)

export const metadata: Metadata = {
  title: 'YakGo',
  description: 'Ваш надежный помощник на дорогах Якутии.',
  // другие метаданные...
};

// Экспортируем viewport отдельно
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Disable zoom on mobile
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="font-body antialiased">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://maps.api.2gis.ru/2.0/loader.js?pkg=full&key=1e0bb99c-b88d-4624-974a-63ab8c556c19"
          strategy="afterInteractive"
        />
        <RootProviders>
          {children}
          <Toaster />
        </RootProviders>
      </body>
    </html>
  );
}
