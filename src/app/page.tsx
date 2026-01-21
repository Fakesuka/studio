import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SahaHelper</CardTitle>
          <CardDescription>
            Ваш надежный помощник на дорогах Якутии
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
              <Button className="w-full">Войти / Зарегистрироваться</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="link" size="sm" className="w-full">
            Стать поставщиком услуг
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
