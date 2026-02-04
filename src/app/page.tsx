'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getTelegramUser } from '@/lib/telegram';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('yakgo_has_visited');

    // Get Telegram user data
    const telegramUser = getTelegramUser();

    if (telegramUser) {
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
      setUserName(fullName || telegramUser.first_name || 'Пользователь');

      // If user has visited before, auto-redirect to dashboard
      if (hasVisited === 'true') {
        setIsReturningUser(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000); // Slightly longer delay to enjoy the animation
      }
    }
  }, [router]);

  const handleEnter = () => {
    // Mark that user has visited
    localStorage.setItem('yakgo_has_visited', 'true');
    router.push('/dashboard');
  };

  const backgroundImage = theme === 'light' ? '/bckwhite.png' : '/bckdark.png';

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#0A0D1F] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(93,255,255,0.35),transparent_60%)] opacity-80" />
        <div className="absolute inset-x-0 top-[-20%] h-[60%] bg-[radial-gradient(circle,rgba(47,230,255,0.35),transparent_70%)] blur-[40px]" />
        <div className="absolute inset-x-0 top-[10%] h-[60%] bg-[radial-gradient(circle_at_right,rgba(32,255,201,0.3),transparent_65%)] blur-[60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,31,0.1),rgba(10,13,31,0.95))]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-6">
        <div className="relative w-full max-w-3xl">
          <div className="absolute inset-0 rounded-[32px] border border-white/20 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_55%)]" />
            <svg
              viewBox="0 0 900 560"
              className="relative h-auto w-full"
              aria-hidden="true"
            >
              <rect
                x="40"
                y="40"
                width="820"
                height="420"
                rx="24"
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
              />
              <path
                d="M 120 330 L 160 280 L 210 250 L 250 220 L 300 210 L 350 190 L 410 170 L 470 160 L 520 150 L 580 140 L 640 130 L 700 120 L 760 110"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="3"
              />
              <path
                d="M 130 320 Q 250 200 360 210 Q 520 220 720 140"
                fill="none"
                stroke="rgba(128,255,255,0.8)"
                strokeWidth="6"
                strokeDasharray="16 12"
                strokeLinecap="round"
                className="route-dash"
              />
              {[
                [130, 320],
                [260, 230],
                [360, 210],
                [520, 220],
                [650, 170],
                [720, 140],
              ].map(([cx, cy], index) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={index === 5 ? 12 : 8}
                  fill="rgba(128,255,255,0.9)"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="3"
                />
              ))}
            </svg>
            <div className="mt-6 text-center text-sm uppercase tracking-[0.3em] text-white/70">
              Загрузка маршрутов...
            </div>
            <div className="mx-auto mt-3 h-2 w-2/3 rounded-full bg-white/10">
              <div className="progress-bar h-full rounded-full bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-200" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-display font-semibold tracking-[0.15em]">
            АВРОРА.
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.4em] text-white/70">
            АВТОСЕРВИСЫ ЯКУТИИ
          </p>
          {userName && (
            <p className="mt-4 text-sm text-cyan-200/90">Привет, {userName}</p>
          )}
        </div>

        {!isReturningUser && (
          <Button
            size="lg"
            variant="neon"
            className="w-full max-w-xs text-base font-bold tracking-wide"
            onClick={handleEnter}
          >
            Начать
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
