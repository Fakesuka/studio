'use client';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sendDriverLocation } from '@/lib/websocket';
import { getTelegramUser } from '@/lib/telegram';
import {
  Snowflake,
  Bell,
  MapPin,
  MessageSquare,
  DollarSign,
  CheckCircle,
  Phone,
  Navigation,
  Wallet,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function AvailableOrderCard({ order }: { order: Order }) {
  const { acceptOrder, driverProfile } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isAccepting, setIsAccepting] = useState(false);
  const [showLowBalanceDialog, setShowLowBalanceDialog] = useState(false);

  const COMMISSION_RATE = 0.10;
  const orderPrice = order.price ?? 0;
  const orderCommission = orderPrice * COMMISSION_RATE;
  const currentBalance = driverProfile?.balance ?? 0;
  const hasEnoughBalance = currentBalance >= orderCommission;

  const handleAcceptAttempt = () => {
    setIsAccepting(true);
    if (!driverProfile) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Профиль водителя не найден.',
      });
      setIsAccepting(false);
      return;
    }

    if (!hasEnoughBalance) {
      setShowLowBalanceDialog(true);
      setIsAccepting(false);
    } else {
      acceptOrder(order.id);
      toast({
        title: 'Заказ принят!',
        description: `Вы приняли заказ #${order.id}.`,
      });
      setIsAccepting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{order.service}</CardTitle>
          <CardDescription>
            Заказ #{order.id} от{' '}
            {format(new Date(order.date), 'd MMM, HH:mm', { locale: ru })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <strong>Адрес:</strong> {order.location}
            </p>
          </div>
          <div>
            <p className="flex items-start gap-2 text-sm">
              <MessageSquare className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>
                <strong>Описание:</strong> {order.description}
              </span>
            </p>
          </div>
          {order.photo && (
            <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.photo}
                alt="Фото к заказу"
                className="object-cover"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2 md:flex-row md:justify-between">
          <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold">
              {orderPrice.toLocaleString('ru-RU', { currency: 'RUB' })} ₽
            </span>
          </div>
          <Button
            onClick={handleAcceptAttempt}
            size="lg"
            className="w-full md:w-auto"
            disabled={isAccepting}
          >
            Принять заказ
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog
        open={showLowBalanceDialog}
        onOpenChange={setShowLowBalanceDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Недостаточно средств</AlertDialogTitle>
            <AlertDialogDescription>
              Ваш текущий баланс:{' '}
              <span className="font-medium text-foreground">
                {currentBalance.toLocaleString('ru-RU', { currency: 'RUB' })} ₽
              </span>
              .
              <br />
              Для принятия этого заказа необходима комиссия в размере{' '}
              <span className="font-medium text-foreground">
                {orderCommission.toLocaleString('ru-RU', { currency: 'RUB' })}{' '}
                ₽
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Закрыть</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/driver/profile')}>
              <Wallet className="mr-2 h-4 w-4" />
              Пополнить кошелек
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ActiveDriverOrderCard({ order }: { order: Order }) {
  const { completeOrder } = useAppContext();
  const { toast } = useToast();
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const user = getTelegramUser();

  // Broadcast driver location in real-time
  useEffect(() => {
    if (!navigator.geolocation || !user?.id) return;

    setIsTrackingLocation(true);
    let watchId: number;

    // Send location updates every 5 seconds
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendDriverLocation(
          user.id,
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Ошибка геолокации',
          description: 'Не удалось определить ваше местоположение.',
        });
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      setIsTrackingLocation(false);
    };
  }, [user?.id, toast]);

  const handleComplete = () => {
    completeOrder(order.id);
    toast({
      title: 'Заказ завершен!',
      description: `Заказ #${order.id} выполнен. Оплата зачислена на ваш кошелек.`,
    });
  };

  const COMMISSION_RATE = 0.10;
  const orderPrice = order.price ?? 0;
  const driverEarnings = orderPrice * (1 - COMMISSION_RATE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Активный заказ: {order.service}</CardTitle>
        <CardDescription>
          Выполните заказ #{order.id} по адресу: {order.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrackingLocation && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700 dark:bg-green-950 dark:text-green-300">
            <Navigation className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
              Ваше местоположение отслеживается
            </span>
          </div>
        )}
        <div>
          <h3 className="mb-2 font-semibold">Детали заказа</h3>
          <p className="flex items-start gap-2 text-sm">
            <MessageSquare className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span>
              <strong>Описание от клиента:</strong> {order.description}
            </span>
          </p>
        </div>
        {order.photo && (
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.photo}
              alt="Фото к заказу"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Позвонить клиенту
          </Button>
          <Button variant="outline" className="flex-1">
            <Navigation className="mr-2 h-4 w-4" />
            Маршрут
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">
            Ваш доход: {driverEarnings.toLocaleString('ru-RU', { currency: 'RUB' })}{' '}
            ₽
          </span>
        </div>
        <Button
          onClick={handleComplete}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Завершить заказ
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DriverDashboard() {
  const { isDriver, isContextLoading, orders, activeDriverOrder } =
    useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isContextLoading && !isDriver) {
      router.replace('/driver/register');
    }
  }, [isDriver, isContextLoading, router]);

  if (isContextLoading || !isDriver) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Snowflake className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeDriverOrder) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Выполняется заказ</h1>
          <p className="text-muted-foreground">
            Информация о вашем текущем заказе.
          </p>
        </div>
        <ActiveDriverOrderCard order={activeDriverOrder} />
      </div>
    );
  }

  const availableOrders = (orders || []).filter(o => o.status === 'Ищет исполнителя');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новые заказы</h1>
        <p className="text-muted-foreground">
          Здесь будут отображаться доступные заказы в реальном времени.
        </p>
      </div>

      {availableOrders.length > 0 ? (
        <div className="space-y-4">
          {availableOrders.map(order => (
            <AvailableOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-semibold text-muted-foreground">
                  Нет доступных заказов
                </p>
                <p className="text-sm text-muted-foreground">
                  Как только появится новый заказ, вы увидите его здесь.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
