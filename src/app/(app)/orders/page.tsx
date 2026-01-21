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
import { useAppContext } from '@/context/AppContext';
import type { OrderStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const getStatusVariant = (status: OrderStatus) => {
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

export default function OrdersPage() {
  const { orders, isContextLoading } = useAppContext();
  const MOCK_USER_ID = 'self';
  const userOrders = orders
    .filter(o => o.userId === MOCK_USER_ID)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои заказы</CardTitle>
        <CardDescription>
          Список ваших недавних запросов на обслуживание.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <TableHead className="hidden md:table-cell">Дата</TableHead>
                <TableHead className="text-right">Цена</TableHead>
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
                    <Badge variant={getStatusVariant(order.status)}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">У вас пока нет заказов.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
