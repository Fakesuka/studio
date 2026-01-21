'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Car } from 'lucide-react';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(p => p.id === 'login-bg');
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ЗАМЕНИТЬ: Здесь вызовите ваш API для отправки СМС
    console.log(`Sending SMS to ${phone}`);
    router.push(`/verify?phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      {loginBg && (
        <Image
          src={loginBg.imageUrl}
          alt={loginBg.description}
          fill
          className="absolute inset-0 -z-10 h-full w-full object-cover brightness-50"
          data-ai-hint={loginBg.imageHint}
          priority
        />
      )}
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Vroom</CardTitle>
          </div>
          <CardDescription>
            Помощь на дорогах Якутии в любое время
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Получить код
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}