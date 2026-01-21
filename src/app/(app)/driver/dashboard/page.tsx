'use client';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ListChecks, Bell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';

export default function DriverDashboard() {
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
        <h1 className="text-3xl font-bold">Панель водителя</h1>
        <p className="text-muted-foreground">
          Добро пожаловать, {driverProfile.name}!
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ваш профиль</CardTitle>
          <CardDescription>
            Статус: <span className="font-semibold text-green-600">Активен</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Автомобиль:</strong> {driverProfile.vehicle}
          </p>
          <p>
            <strong>Оказываемые услуги:</strong>
          </p>
          <ul className="list-disc pl-5">
            {driverProfile.services.map(service => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Новые заказы
            </CardTitle>
            <CardDescription>
              Здесь будут отображаться доступные заказы в реальном времени.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Нет доступных заказов</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Активные и выполненные
            </CardTitle>
            <CardDescription>История ваших принятых заказов.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">
                У вас нет активных заказов
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
