'use client';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Bell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function DriverDashboard() {
  const { isDriver, isContextLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isContextLoading && !isDriver) {
      router.replace('/driver/register');
    }
  }, [isDriver, isContextLoading, router]);

  if (isContextLoading || !isDriver) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новые заказы</h1>
        <p className="text-muted-foreground">
          Здесь будут отображаться доступные заказы в реальном времени.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Лента заказов
          </CardTitle>
          <CardDescription>
            Здесь будут отображаться доступные заказы.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Нет доступных заказов</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
