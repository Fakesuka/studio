'use client';

import { Wrench } from 'lucide-react';
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
import type { MarketplaceOrderStatus, OrderStatus } from '@/lib/types';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/weather-widget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUserId } from '@/lib/user-utils';

const getServiceStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Завершен':
      return 'secondary';
    case 'В процессе':
      return 'default';
    case 'Отменен':
      return 'destructive';
    case 'Ищет исполнителя':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getMarketplaceStatusVariant = (status: MarketplaceOrderStatus) => {
  switch (status) {
    case 'Завершен':
      return 'secondary';
    case 'Доставляется':
    case 'В обработке':
      return 'default';
    case 'Отменен':
      return 'destructive';
    case 'Новый':
      return 'outline';
    default:
      return 'secondary';
  }
};

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
  const { orders, marketplaceOrders, isContextLoading } = useAppContext();
  const userId = getCurrentUserId();

  const userOrders = (orders || [])
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const userMarketplaceOrders = (marketplaceOrders || [])
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
              <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-6 text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_24px_50px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6B7CFF] to-[#4658E5] text-white shadow-lg dark:from-[#22D3EE] dark:to-[#10B981]">
                  <Wrench className="h-6 w-6" />
                </div>
                <span className="text-lg font-semibold">Новая заявка</span>
                <span className="text-xs text-slate-500 dark:text-cyan-100/80">
                  Быстро подобрать исполнителя
                </span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>История</CardTitle>
          <CardDescription>
            Ваши заказы услуг и покупки в маркете в одном месте.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="services">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="marketplace">Покупки</TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="mt-4 space-y-3">
              {userOrders.length > 0 ? (
                userOrders.map(order => (
                  <Card key={order.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.service}</CardTitle>
                        <CardDescription>{order.location}</CardDescription>
                      </div>
                      <Badge variant={getServiceStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>№ {order.orderId || order.id}</span>
                      <span>{order.price.toLocaleString('ru-RU')} ₽</span>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  У вас пока нет заказов услуг.
                </div>
              )}
            </TabsContent>
            <TabsContent value="marketplace" className="mt-4 space-y-3">
              {userMarketplaceOrders.length > 0 ? (
                userMarketplaceOrders.map(order => (
                  <Card key={order.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Заказ в маркете
                        </CardTitle>
                        <CardDescription>
                          № {order.id}
                        </CardDescription>
                      </div>
                      <Badge variant={getMarketplaceStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{order.total.toLocaleString('ru-RU')} ₽</span>
                      <span>{order.items.length} поз.</span>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  Покупок в маркете пока нет.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Link href="/orders" className="w-full">
            <Button variant="outline" className="w-full">
              Открыть полную историю
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
