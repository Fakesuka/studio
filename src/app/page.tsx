'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to dashboard where TelegramGuard handles the welcome screen
    router.replace('/dashboard');
  }, [router]);

  // Return minimal loading state during redirect
  return (
    <div className="min-h-screen w-screen bg-[#080B18] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
