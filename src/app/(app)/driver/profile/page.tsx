'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, User, Wallet, Plus, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DriverProfilePage() {
  const { isDriver, driverProfile, isContextLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isContextLoading && !isDriver) {
      router.replace('/driver/register');
    }
  }, [isDriver, isContextLoading, router]);

  if (isContextLoading || !isDriver || !driverProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Профиль водителя</h1>
        <p className="text-muted-foreground">
          Управление вашим профилем и кошельком.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ваш профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Имя:</strong> {driverProfile.name}
          </p>
          <p>
            <strong>Автомобиль:</strong> {driverProfile.vehicle}
          </p>
          <div className="space-y-1">
            <p className="font-medium">
              <strong>Оказываемые услуги:</strong>
            </p>
            <ul className="list-disc pl-5">
              {driverProfile.services.map(service => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Кошелек
          </CardTitle>
          <CardDescription>Ваш текущий баланс и операции.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {(driverProfile.balance ?? 0).toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            })}
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Пополнить
          </Button>
          <Button variant="secondary" className="flex-1">
            <ArrowRight className="mr-2 h-4 w-4" />
            Вывести
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
