import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { RootProviders } from '@/components/root-providers';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic-ext'],
  variable: '--font-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'YakGo',
  description: 'Ваш надежный помощник на дорогах Якутии.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <body className={`${jakarta.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}>
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
