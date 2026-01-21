'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  // MOCK DATA since TWA SDK is removed
  const name = 'Иван Петров';
  const username = '@ivan_petrov';

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>
          Эта информация является временной. Интеграция с Telegram временно
          отключена для устранения ошибок.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Полное имя</Label>
            <Input id="name" readOnly value={name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input id="username" readOnly value={username} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
