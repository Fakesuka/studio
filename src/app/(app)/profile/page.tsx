import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUser } from '@/lib/data';

export default function ProfilePage() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>
          Обновите вашу личную информацию и настройки.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Полное имя</Label>
            <Input id="name" defaultValue={mockUser.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <Input id="phone" type="tel" defaultValue={mockUser.phone} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={mockUser.email} />
          </div>
          <Button type="submit">Сохранить изменения</Button>
        </form>
      </CardContent>
    </Card>
  );
}
