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
  Plus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockProviders } from '@/lib/data';
import type { Order, ServiceProvider, ServiceType } from '@/lib/types';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import Map2GIS from '@/components/map-2gis';

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
          <Map2GIS center={[62.5353, 113.9613]} zoom={13} />
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

export default function Dashboard() {
  const { activeOrder } = useAppContext();

  const serviceTypes = [
    { value: 'отогрев', label: 'Отогрев авто', icon: Flame },
    { value: 'доставка топлива', label: 'Доставка топлива', icon: Fuel },
    { value: 'техпомощь', label: 'Техпомощь', icon: Wrench },
    { value: 'эвакуатор', label: 'Эвакуатор', icon: Truck },
    { value: 'прочее', label: 'Прочее', icon: Plus },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Нужна помощь?</CardTitle>
            <CardDescription>
              Быстро вызовите специалиста для решения вашей проблемы.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="h-full w-full flex-col gap-2 py-6 transition-transform active:scale-95"
                >
                  <Wrench className="h-10 w-10" />
                  <span className="text-lg">Создать заявку</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80"
                align="start"
                sideOffset={10}
              >
                {serviceTypes.map(service => (
                  <Link
                    href={`/services/new?service=${service.value}`}
                    key={service.value}
                  >
                    <DropdownMenuItem className="cursor-pointer py-3 text-base">
                      <service.icon className="mr-3 h-6 w-6 text-muted-foreground" />
                      <span>{service.label}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

      {activeOrder ? (
        <ActiveOrderCard order={activeOrder} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="transition-transform active:scale-95">
                  Создать заявку
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80"
                align="start"
                sideOffset={10}
              >
                {serviceTypes.map(service => (
                  <Link
                    href={`/services/new?service=${service.value}`}
                    key={service.value}
                  >
                    <DropdownMenuItem className="cursor-pointer py-3 text-base">
                      <service.icon className="mr-3 h-6 w-6 text-muted-foreground" />
                      <span>{service.label}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
