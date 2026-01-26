'use client';
import { useAppContext } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ListChecks } from 'lucide-react';
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

export default function DriverHistoryPage() {
  const { orders, driverProfile, isContextLoading } = useAppContext();
  const driverOrders = driverProfile
    ? (orders || [])
        .filter(o => o.driverId === driverProfile.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">История заказов</h1>
        <p className="text-muted-foreground">
          Список ваших выполненных и активных заказов.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Активные и выполненные
          </CardTitle>
          <CardDescription>История ваших принятых заказов.</CardDescription>
        </CardHeader>
        <CardContent>
          {isContextLoading ? (
            <p>Загрузка...</p>
          ) : driverOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    ID Заказа
                  </TableHead>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="hidden md:table-cell">Дата</TableHead>
                  <TableHead className="text-right">Доход</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverOrders.map(order => (
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
              <p className="text-muted-foreground">
                У вас пока нет выполненных заказов.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
