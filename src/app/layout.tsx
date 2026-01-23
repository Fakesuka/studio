import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { RootProviders } from '@/components/root-providers';

import './globals.css';

// Используем системные шрифты вместо Google Fonts (для РФ)

export const metadata: Metadata = {
  title: 'YakGo',
  description: 'Ваш надежный помощник на дорогах Якутии.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          async
          charSet="utf-8"
          src="https://maps.api.2gis.ru/2.0/loader.js?pkg=full&key=1e0bb99c-b88d-4624-974a-63ab8c556c19"
        ></script>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="font-body antialiased">
        <RootProviders>
          {children}
          <Toaster />
        </RootProviders>
      </body>
    </html>
  );
}
