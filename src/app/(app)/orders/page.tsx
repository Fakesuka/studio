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
import { mockOrders } from '@/lib/data';
import type { OrderStatus } from '@/lib/types';

const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    case 'Pending':
      return 'outline';
    default:
      return 'default';
  }
};

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>
          A list of your recent service requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Order ID
              </TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map(order => (
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
                  {order.date}
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
      </CardContent>
    </Card>
  );
}
