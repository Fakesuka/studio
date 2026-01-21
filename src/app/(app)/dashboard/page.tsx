'use client';

import {
  Car,
  MapPin,
  Star,
  Clock,
  Fuel,
  Wrench,
  Truck,
  Flame,
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
import { mockProviders } from '@/lib/data';
import type { Order, ServiceProvider, ServiceType } from '@/lib/types';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import Map2GIS from '@/components/map-2gis';
import { Skeleton } from '@/components/ui/skeleton';

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
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Активный вызов: {order.id}</CardTitle>
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
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
          <Map2GIS center={[62.035, 129.675]} zoom={13} />
          {order.arrivalTime && (
            <div className="absolute bottom-4 right-4 rounded-md bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-bold">
                  Прибытие: {order.arrivalTime} мин
                </span>
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

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="hidden h-10 w-10 sm:flex">
        <AvatarImage src={provider.avatarUrl} alt="Provider" />
        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 gap-1">
        <p className="text-sm font-medium leading-none">{provider.name}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          {provider.distance} км от вас
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium">
        <Star className="h-4 w-4 fill-primary text-primary" />
        {provider.rating}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 lg:gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Skeleton className="flex h-full min-h-[120px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="relative aspect-[4/3] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { activeClientOrder, isContextLoading } = useAppContext();

  if (isContextLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 lg:gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Нужна помощь?</CardTitle>
            <CardDescription>
              Быстро вызовите специалиста для решения вашей проблемы.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Link href="/services/new" className="flex flex-1 flex-col">
              <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-blue-400 p-6 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-primary/50 active:scale-[0.98] active:shadow-primary/30">
                <Wrench className="h-10 w-10" />
                <span className="text-lg font-bold">Создать заявку</span>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Свободные исполнители</CardTitle>
            <CardDescription>
              Проверенные специалисты поблизости.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {mockProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </CardContent>
        </Card>
      </div>

      {activeClientOrder ? (
        <ActiveOrderCard order={activeClientOrder} />
      ) : (
        <Card className="col-span-1 flex flex-col items-center justify-center text-center lg:col-span-2">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Car className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle>Нет активных вызовов</CardTitle>
            <CardDescription>
              В данный момент у вас нет активных заявок.
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
