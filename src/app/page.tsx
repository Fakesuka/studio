'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Snowflake } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the dashboard page,
    // simulating a user who is already authenticated via Telegram.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Snowflake className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
