import Image from 'next/image';
import Link from 'next/link';
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
          <div className="flex justify-center items-center gap-2 mb-2">
            <Car className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Vroom</CardTitle>
          </div>
          <CardDescription>
            Помощь на дорогах Якутии в любое время
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Получить код</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
