'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

export default function DriverHistoryPage() {
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
          <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">
              У вас пока нет выполненных заказов.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
