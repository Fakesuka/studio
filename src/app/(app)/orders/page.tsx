'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import type { OrderStatus, MarketplaceOrderStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, MapPin, Clock, AlertCircle, Wrench } from 'lucide-react';
import ReviewForm from '@/components/review-form';
import { Chat } from '@/components/chat';
import { getCurrentUserId } from '@/lib/user-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function OrdersPage() {
  const { orders, marketplaceOrders, isContextLoading } = useAppContext();
  const userId = getCurrentUserId();
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<{ id: string; driverId: string; driverName: string } | null>(null);

  const userOrders = (orders || [])
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const userMarketplaceOrders = (marketplaceOrders || [])
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Мои заказы</h1>
        <p className="text-gray-400">
          История ваших заказов услуг и покупок на маркетплейсе.
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/5">
          <TabsTrigger value="services" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Заказы услуг</TabsTrigger>
          <TabsTrigger value="marketplace" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Покупки в маркете</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-6">
          {isContextLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent" />
            </div>
          ) : userOrders.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile/Card View for all Screens to keep it consistent and glassy */}
              {userOrders.map(order => (
                <div key={order.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-neon-cyan/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Header */}
                  <div className="relative flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 ${order.status === 'В процессе' ? 'bg-neon-cyan/20 text-neon-cyan animate-pulse-glow' : 'bg-white/5 text-gray-400'}`}>
                        {(order.service as string) === 'Служба спасения' ? <AlertCircle className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white leading-tight">{order.service}</h3>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getServiceStatusVariant(order.status)} className="backdrop-blur-md shadow-lg">
                      {order.status}
                    </Badge>
                  </div>

                  {/* Timeline Visualization */}
                  <div className="relative mb-6 px-2">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {[
                        { step: 'Поиск', active: true, completed: order.status !== 'Ищет исполнителя' },
                        { step: 'В пути', active: order.status === 'В процессе', completed: order.status === 'Завершен' },
                        { step: 'Работа', active: order.status === 'В процессе' && order.provider !== undefined, completed: order.status === 'Завершен' },
                        { step: 'Готово', active: false, completed: order.status === 'Завершен' },
                      ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`h-3 w-3 rounded-full border-2 z-10 transition-all duration-300 ${s.completed ? 'bg-neon-cyan border-neon-cyan scale-110' :
                            s.active ? 'bg-black border-neon-cyan animate-pulse scale-125' :
                              'bg-black border-white/20'
                            }`} />
                          <span className={`text-[10px] font-medium uppercase tracking-wider ${s.completed || s.active ? 'text-neon-cyan' : 'text-gray-600'
                            }`}>{s.step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 rounded-xl p-4 mb-4 border border-white/5 relative z-10">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Дата и время</span>
                      <div className="text-gray-200 font-medium flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-neon-purple" />
                        {format(new Date(order.date), 'd MMM, HH:mm', { locale: ru })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Стоимость</span>
                      <div className="text-xl font-mono font-bold text-neon-cyan tracking-tight">
                        {order.price.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2 relative z-10">
                    {(order.status === 'В процессе' || order.status === 'Завершен') && order.provider && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 bg-black/20 backdrop-blur-md"
                        onClick={() => setChatOrder({
                          id: order.id,
                          driverId: order.provider?.id || '',
                          driverName: order.provider?.name || 'Водитель'
                        })}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Чат с водителем
                      </Button>
                    )}
                    {order.status === 'Завершен' && (
                      <Button
                        size="sm"
                        variant="glass"
                        className="shadow-neon-cyan/20"
                        onClick={() => setReviewOrderId(order.id)}
                      >
                        <Star className="mr-2 h-4 w-4 fill-current" />
                        Оценить
                      </Button>
                    )}
                    {order.status === 'Ищет исполнителя' && (
                      <Button size="sm" variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30">
                        Отменить
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
              <p className="text-gray-500">
                У вас пока нет заказов услуг.
              </p>
              <Button variant="link" className="text-neon-cyan mt-2">
                Заказать услугу
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="marketplace" className="mt-6">
          {isContextLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon-purple border-t-transparent" />
            </div>
          ) : userMarketplaceOrders.length > 0 ? (
            <div className="space-y-4">
              {userMarketplaceOrders.map(order => (
                <div key={order.id} className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">Заказ #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-400 mt-1">{order.items.length} товара</p>
                    </div>
                    <Badge variant={getMarketplaceStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-600 mb-1">Дата</span>
                      {format(new Date(order.date), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </div>
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wider text-gray-600 mb-1">Сумма</span>
                      <span className="text-lg font-mono text-neon-purple">{order.total.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
              <p className="text-gray-500">
                У вас пока нет покупок.
              </p>
              <Button variant="link" className="text-neon-purple mt-2">
                Перейти в маркет
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>


      {/* Dialog для оценки заказа */}
      <Dialog open={!!reviewOrderId} onOpenChange={(open) => !open && setReviewOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Оценить заказ</DialogTitle>
            <DialogDescription>
              Пожалуйста, оцените качество выполненной работы
            </DialogDescription>
          </DialogHeader>
          {reviewOrderId && (
            <ReviewForm
              orderId={reviewOrderId}
              onSuccess={() => setReviewOrderId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog для чата */}
      <Dialog open={!!chatOrder} onOpenChange={(open) => !open && setChatOrder(null)}>
        <DialogContent className="max-w-2xl">
          {chatOrder && (
            <Chat
              orderId={chatOrder.id}
              receiverId={chatOrder.driverId}
              receiverName={chatOrder.driverName}
            />
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
