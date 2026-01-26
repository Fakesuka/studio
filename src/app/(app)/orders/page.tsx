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
import { Star, MessageSquare } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle>Мои заказы</CardTitle>
        <CardDescription>
          История ваших заказов услуг и покупок на маркетплейсе.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Заказы услуг</TabsTrigger>
            <TabsTrigger value="marketplace">Покупки в маркете</TabsTrigger>
          </TabsList>
          <TabsContent value="services">
            {isContextLoading ? (
              <p>Загрузка...</p>
            ) : userOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      ID Заказа
                    </TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Дата
                    </TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="hidden font-medium sm:table-cell">
                        {order.id}
                      </TableCell>
                      <TableCell>{order.service}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getServiceStatusVariant(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(order.date), 'd MMMM yyyy, HH:mm', {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.price.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(order.status === 'В процессе' || order.status === 'Завершен') && order.provider && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setChatOrder({
                                id: order.id,
                                driverId: order.provider?.id || '',
                                driverName: order.provider?.name || 'Водитель'
                              })}
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              Чат
                            </Button>
                          )}
                          {order.status === 'Завершен' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewOrderId(order.id)}
                            >
                              <Star className="mr-1 h-3 w-3" />
                              Оценить
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">
                  У вас пока нет заказов услуг.
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="marketplace">
            {isContextLoading ? (
              <p>Загрузка...</p>
            ) : userMarketplaceOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      ID Заказа
                    </TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Кол-во</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Дата
                    </TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMarketplaceOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="hidden font-medium sm:table-cell">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getMarketplaceStatusVariant(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.items.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(order.date), 'd MMMM yyyy, HH:mm', {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.total.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">
                  У вас пока нет покупок.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

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
    </Card>
  );
}
