'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Store, CheckCircle } from 'lucide-react';

const sellerFormSchema = z.object({
  storeName: z
    .string()
    .min(3, 'Название магазина должно быть длиннее 3 символов.'),
  storeDescription: z
    .string()
    .min(10, 'Описание должно быть длиннее 10 символов.'),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

export default function ProfilePage() {
  const { isSeller, sellerProfile, registerAsSeller } = useAppContext();
  const { toast } = useToast();

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      storeName: '',
      storeDescription: '',
    },
  });

  const onSubmit = (data: SellerFormValues) => {
    registerAsSeller(data);
    toast({
      title: 'Поздравляем!',
      description: 'Вы успешно зарегистрированы как продавец.',
    });
  };

  // MOCK DATA since TWA SDK is removed
  const name = 'Иван Петров';
  const username = '@ivan_petrov';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
          <CardDescription>
            Здесь вы можете управлять информацией о своем профиле.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Полное имя</Label>
              <Input id="name" defaultValue={name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" defaultValue={username} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Сохранить изменения</Button>
        </CardFooter>
      </Card>

      {isSeller ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Ваш магазин
            </CardTitle>
            <CardDescription>
              Вы зарегистрированы как продавец. Здесь вы скоро сможете управлять
              своим магазином.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-green-500 bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Статус продавца: Активен</p>
            </div>
            <div>
              <h4 className="font-semibold">{sellerProfile?.storeName}</h4>
              <p className="text-sm text-muted-foreground">
                {sellerProfile?.storeDescription}
              </p>
            </div>
            <Button className="w-full" disabled>
              Управлять магазином (скоро)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Стать продавцом
            </CardTitle>
            <CardDescription>
              Заполните форму, чтобы начать продавать свои товары на нашей
              площадке.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название магазина</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Например, 'Автозапчасти от Ивана'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Краткое описание магазина</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите, какие товары вы продаете..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  Зарегистрировать магазин
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
