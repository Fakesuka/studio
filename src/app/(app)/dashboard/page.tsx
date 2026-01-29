'use client';

import {
  Car,
  Star,
  Clock,
  Fuel,
  Wrench,
  Truck,
  Flame,
  AlertTriangle,
  LocateFixed,
  ArrowUpRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Order, ServiceType } from '@/lib/types';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/weather-widget';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { MapMarker } from '@/components/map-2gis';
import { subscribeToOrder } from '@/lib/websocket';

const Map2GIS = dynamic(() => import('@/components/map-2gis'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

function getServiceIcon(serviceType: ServiceType) {
  switch (serviceType) {
    case 'Отогрев авто':
      return <Flame className="h-4 w-4 text-muted-foreground" />;
    case 'Доставка топлива':
      return <Fuel className="h-4 w-4 text-muted-foreground" />;
    case 'Техпомощь':
      return <Wrench className="h-4 w-4 text-muted-foreground" />;
    case 'Эвакуатор':
      return <Truck className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Car className="h-4 w-4 text-muted-foreground" />;
  }
}

function ActiveOrderCard({ order }: { order: Order }) {
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(
    null
  );
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(order.arrivalTime);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    // Countdown every minute
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => (prevTime && prevTime > 0 ? prevTime - 1 : 0));
    }, 60000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (order.latitude && order.longitude) {
      setCustomerCoords([order.latitude, order.longitude]);
      setLocationStatus('success');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Геолокация не поддерживается вашим браузером.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setCustomerCoords([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setLocationStatus('success');
      },
      error => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Вы запретили доступ к геолокации.');
        } else {
          setLocationError('Не удалось определить ваше местоположение.');
        }
      }
    );
  }, []);

  // Subscribe to real-time driver location updates via WebSocket
  useEffect(() => {
    if (!order.id) return;

    const unsubscribe = subscribeToOrder(order.id, (data) => {
      if (data.latitude && data.longitude) {
        setDriverCoords([data.latitude, data.longitude]);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [order.id]);

  const markers = useMemo((): MapMarker[] => {
    const m: MapMarker[] = [];

    // Customer marker (blue pin)
    if (customerCoords) {
      m.push({
        id: 'customer',
        coords: customerCoords,
        popup: '<div style="text-align: center;"><strong>📍 Вы здесь</strong><br/><span style="color: #3b82f6;">Точка клиента</span></div>',
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            <path fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" d="M16 1C9.925 1 5 5.925 5 12c0 8.25 11 28 11 28s11-19.75 11-28c0-6.075-4.925-11-11-11z"/>
            <circle cx="16" cy="12" r="5" fill="white"/>
          </svg>
        `),
        iconSize: [32, 42],
      });
    }

    // Driver marker (green car icon)
    if (driverCoords) {
      m.push({
        id: 'driver',
        coords: driverCoords,
        popup: '<div style="text-align: center;"><strong>🚗 Водитель</strong><br/><span style="color: #22c55e;">Едет к вам</span></div>',
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            <path fill="#22c55e" stroke="#16a34a" stroke-width="2" d="M16 1C9.925 1 5 5.925 5 12c0 8.25 11 28 11 28s11-19.75 11-28c0-6.075-4.925-11-11-11z"/>
            <text x="16" y="16" font-size="12" text-anchor="middle" fill="white">🚗</text>
          </svg>
        `),
        iconSize: [32, 42],
      });
    }

    return m;
  }, [customerCoords, driverCoords]);

  const routes = useMemo(() => {
    if (!customerCoords || !driverCoords) return [];
    return [[driverCoords, customerCoords]];
  }, [customerCoords, driverCoords]);

  const renderMapContent = () => {
    if (locationStatus === 'loading') {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted">
          <LocateFixed className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">
            Определяем ваше местоположение...
          </p>
        </div>
      );
    }

    if (locationStatus === 'error' || !customerCoords) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="font-semibold text-destructive">Ошибка геолокации</p>
          <p className="text-sm text-muted-foreground">{locationError}</p>
        </div>
      );
    }

    return (
      <Map2GIS
        center={customerCoords}
        zoom={13}
        markers={markers}
        routes={routes}
      />
    );
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Активный вызов: {order.orderId || order.id}</CardTitle>
        <CardDescription>
          {order.service} - Статус:{' '}
          <Badge variant="default">{order.status}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {order.provider && (
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-14 w-14 sm:flex">
              <AvatarImage src={order.provider.avatarUrl} alt="Provider" />
              <AvatarFallback>
                {order.provider.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {order.provider.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.provider.vehicle}
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>{order.provider.rating}</span>
              </div>
            </div>
          </div>
        )}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border">
          {renderMapContent()}
          {timeRemaining && timeRemaining > 0 ? (
            <div className="absolute bottom-4 right-4 z-[1000] rounded-md bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-bold">
                  Прибытие через: ~{timeRemaining} мин
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-4 right-4 z-[1000] rounded-md bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-bold">Водитель прибывает</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          Детали вызова
        </Button>
      </CardFooter>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-1 h-4 w-32" />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Skeleton className="flex h-full min-h-[140px] w-full" />
          </CardContent>
        </Card>
      </div>
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-40" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-40" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { activeClientOrder, orders, isContextLoading } = useAppContext();

  const hasOrders = (orders || []).length > 0;

  if (isContextLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WeatherWidget />
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Создать заявку</CardTitle>
            <CardDescription>
              Опишите проблему, укажите адрес и ожидаемую стоимость.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Link href="/services/new" className="flex flex-1 flex-col">
              <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <Wrench className="h-10 w-10 text-yellow-400" />
                <span className="text-lg font-semibold">Новая заявка</span>
                <span className="text-xs text-slate-300">
                  Быстро подобрать исполнителя
                </span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Мои заказы</h2>
          <p className="text-sm text-muted-foreground">
            Текущие и завершенные заявки в одном месте.
          </p>
        </div>
        <Link href="/orders" className="text-sm text-primary">
          <span className="inline-flex items-center gap-1">
            Все заказы
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      {activeClientOrder ? (
        <ActiveOrderCard order={activeClientOrder} />
      ) : null}

      {hasOrders ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {(orders || []).map(order => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {order.service}
                  </CardTitle>
                  <CardDescription>{order.location}</CardDescription>
                </div>
                <Badge variant={order.status === 'В процессе' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span>№ {order.orderId || order.id}</span>
                <span>{order.price.toLocaleString('ru-RU')} ₽</span>
              </CardContent>
              <CardFooter>
                <Link href="/orders" className="w-full">
                  <Button variant="outline" className="w-full">
                    Открыть заказ
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Car className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle>Заказов пока нет</CardTitle>
            <CardDescription>
              Создайте первую заявку — мы найдем исполнителя рядом.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/services/new">
              <Button className="transition-transform active:scale-95">
                Создать заявку
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
