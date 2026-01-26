'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { GlobalErrorHandler } from './global-error-handler';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GlobalErrorHandler />
      {children}
    </NextThemesProvider>
  );
}
