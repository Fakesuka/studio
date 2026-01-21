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
import Map2GIS, { type MapMarker } from '@/components/map-2gis';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/weather-widget';
import { useState, useEffect } from 'react';

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
  const customerCoords: [number, number] = [62.035, 129.675]; // Based on existing hardcoded value
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(
    null
  );

  // Simulate driver location update
  useEffect(() => {
    // A random starting point for the driver, somewhere around the customer
    const initialDriverLat = customerCoords[0] + (Math.random() - 0.5) * 0.1;
    const initialDriverLng = customerCoords[1] + (Math.random() - 0.5) * 0.1;
    setDriverCoords([initialDriverLat, initialDriverLng]);

    const journeySteps = 50;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep > journeySteps) {
        clearInterval(interval);
        setDriverCoords(customerCoords); // Arrived
        return;
      }

      setDriverCoords(() => {
        // Linear interpolation
        const lat =
          initialDriverLat +
          (customerCoords[0] - initialDriverLat) * (currentStep / journeySteps);
        const lng =
          initialDriverLng +
          (customerCoords[1] - initialDriverLng) * (currentStep / journeySteps);
        return [lat, lng];
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const markers: MapMarker[] = [
    {
      id: 'customer',
      coords: customerCoords,
      label: 'Вы здесь',
      iconUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuOTg0MSA0LjAxMzk4QzguNTk5MyA0LjAxMzk4IDUuODg5MyA2LjcyMzk4IDUuODg5MyAxMC4xMDk0QzUuODg5MyAxMi4zNTU1IDcuMiA0LjE0MDYgMTEuOTg0MSAxOS45NTA4QzE2Ljc2NzggMTQuMTQwNiAxOC4wNzg4IDEyLjM1NTUgMTguMDc4OCAxMC4xMDk0QzE4LjA3ODggNi43MjM5OCAxNS4zNjkgNC4wMTM5OCAxMS45ODQxIDQuMDEzOThaIiBmaWxsPSIjZGMyNjI2Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMi41IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==`,
      iconSize: [32, 32],
    },
  ];

  if (driverCoords) {
    markers.push({
      id: 'driver',
      coords: driverCoords,
      label: 'Водитель',
      iconUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuOTg0MSA0LjAxMzk4QzguNTk5MyA0LjAxMzk4IDUuODg5MyA2LjcyMzk4IDUuODg5MyAxMC4xMDk0QzUuODg5MyAxMi4zNTU1IDcuMiA0LjE0MDYgMTEuOTg0MSAxOS45NTA4QzE2Ljc2NzggMTQuMTQwNiAxOC4wNzg4IDEyLjM1NTUgMTguMDc4OCAxMC4xMDk0QzE4LjA3ODggNi43MjM5OCAxNS4zNjkgNC4wMTM5OCAxMS45ODQxIDQuMDEzOThaIiBmaWxsPSIjMjU2M2ViIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMi41IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==`,
      iconSize: [32, 32],
    });
  }

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
          <Map2GIS center={customerCoords} zoom={11} markers={markers} />
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
        <WeatherWidget />
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
