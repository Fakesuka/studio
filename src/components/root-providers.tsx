'use client';

// Basic provider setup.
// The Telegram SDK provider has been temporarily removed to resolve installation issues.
export function RootProviders({ children }: { children: React.ReactNode }) {
  // Here you could add other global providers if needed,
  // e.g., for state management or theming.
  return <>{children}</>;
}
