'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Snowflake } from 'lucide-react';

function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const phone = searchParams.get('phone');
  
  // ЗАМЕНИТЬ: жестко закодированный код для симуляции
  const MOCK_CODE = '1234';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ЗАМЕНИТЬ: здесь будет вызов вашего API для проверки кода
    if (code === MOCK_CODE) {
      toast({
        title: 'Успешно!',
        description: 'Вы вошли в систему.',
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Неверный код подтверждения.',
      });
    }
  };

  const handleResendCode = () => {
    // ЗАМЕНИТЬ: здесь будет вызов вашего API для повторной отправки кода
    console.log(`Resending SMS to ${phone}`);
    toast({
      title: 'Код отправлен',
      description: `Новый код отправлен на номер ${phone}.`,
    });
  }

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Snowflake className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">Подтверждение</CardTitle>
        </div>
        <CardDescription>
          Мы отправили код подтверждения на номер
          <br />
          <span className="font-medium text-foreground">{phone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Код подтверждения</Label>
            <Input
              id="code"
              type="text"
              inputMode='numeric'
              placeholder="----"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className="text-center text-2xl tracking-[1em]"
              maxLength={4}
            />
          </div>
          <Button type="submit" className="w-full">
            Войти
          </Button>
          <Button variant="link" size="sm" type="button" onClick={handleResendCode} className="text-muted-foreground">
            Отправить код еще раз
          </Button>
        </form>
      </CardContent>
    </Card>
  </change>
  <change>
    <file>src/components/bottom-nav.tsx</file>
    <content><![CDATA['use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomMenuItems } from '@/lib/menu-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
        {bottomMenuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 p-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
