'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Snowflake, ArrowRight, User, UserCog } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1489675858715-77950c41b893?q=80&w=2070&auto=format&fit=crop"
          alt="Winter road in Yakutia"
          fill
          className="object-cover"
          data-ai-hint="winter road"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center text-primary-foreground p-4">
        <Snowflake className="h-16 w-16 text-primary" />
        <h1 className="mt-4 text-5xl font-bold tracking-tight drop-shadow-md sm:text-6xl">
          YakGo
        </h1>
        <p className="mt-2 max-w-md text-lg text-primary-foreground/90 drop-shadow">
          Ваш надежный помощник на дорогах Якутии.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-4">
          <Link href="/dashboard" passHref>
            <Button size="lg" className="w-full text-lg h-12">
              <User className="mr-2 h-5 w-5" />
              Я клиент
            </Button>
          </Link>
          <Link href="/driver/dashboard" passHref>
            <Button size="lg" variant="secondary" className="w-full text-lg h-12">
              <UserCog className="mr-2 h-5 w-5" />
              Я водитель
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
