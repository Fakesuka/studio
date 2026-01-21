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
import { Store, CheckCircle, ArrowRight, Wallet, Plus } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const sellerFormSchema = z
  .object({
    type: z.enum(['store', 'person'], {
      required_error: 'Пожалуйста, выберите тип.',
    }),
    storeName: z
      .string()
      .min(3, 'Название магазина должно быть длиннее 3 символов.'),
    storeDescription: z
      .string()
      .min(10, 'Описание должно быть длиннее 10 символов.'),
    address: z.string().optional(),
    workingHours: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'store') {
        return (
          !!data.address &&
          data.address.length >= 5 &&
          !!data.workingHours &&
          data.workingHours.length >= 3
        );
      }
      return true;
    },
    {
      message: 'Для магазина необходимо указать адрес и время работы.',
      path: ['address'],
    }
  );

type SellerFormValues = z.infer<typeof sellerFormSchema>;

export default function ProfilePage() {
  const MOCK_USER_ID = 'self'; // In a real app, this would come from auth.
  const { isSeller, registerAsSeller, shops, sellerProfile } = useAppContext();
  const { toast } = useToast();

  const userShop = shops.find(shop => shop.userId === MOCK_USER_ID);

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      type: 'person',
      storeName: '',
      storeDescription: '',
    },
  });
  const sellerType = sellerForm.watch('type');

  const onSellerSubmit = (data: SellerFormValues) => {
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

      {isSeller && userShop ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-6 w-6" />
                Ваш магазин
              </CardTitle>
              <CardDescription>{userShop.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border border-green-500 bg-green-50 p-4 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">Статус продавца: Активен</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Управляйте товарами и настройками вашего магазина на отдельной
                странице.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/my-store" className="w-full">
                <Button className="w-full">
                  Перейти к управлению магазином
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Кошелек продавца
              </CardTitle>
              <CardDescription>Ваш баланс и операции.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {(sellerProfile?.balance ?? 0).toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Пополнить
              </Button>
              <Button variant="secondary" className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />
                Вывести
              </Button>
            </CardFooter>
          </Card>
        </>
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
          <Form {...sellerForm}>
            <form onSubmit={sellerForm.handleSubmit(onSellerSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={sellerForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Тип продавца</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="person" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Частное лицо
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="store" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Магазин
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sellerForm.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {sellerType === 'store'
                          ? 'Название магазина'
                          : 'Ваше имя или название'}
                      </FormLabel>
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
                  control={sellerForm.control}
                  name="storeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Краткое описание</FormLabel>
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

                {sellerType === 'store' && (
                  <>
                    <FormField
                      control={sellerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес магазина</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="г. Якутск, ул. Ленина, 1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sellerForm.control}
                      name="workingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Время работы</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Пн-Пт: 9:00 - 18:00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sellerForm.formState.isSubmitting}
                >
                  Зарегистрировать
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
