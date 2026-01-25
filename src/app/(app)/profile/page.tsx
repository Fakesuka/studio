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
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getTelegramUser } from '@/lib/telegram';
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
import TopUpBalance from '@/components/top-up-balance';
import {
  Store,
  CheckCircle,
  ArrowRight,
  Wallet,
  Plus,
  Paintbrush,
} from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    agreement: z.literal(true, {
      errorMap: () => ({ message: 'Вы должны принять правила для продавцов.' }),
    }),
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
  const { isSeller, registerAsSeller, shops, sellerProfile, refreshData } = useAppContext();
  const { toast } = useToast();
  const [showTopUp, setShowTopUp] = useState(false);
  const [name, setName] = useState('Загрузка...');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Get data from Telegram WebApp
        const telegramUser = getTelegramUser();
        if (telegramUser) {
          const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
          setName(fullName);
          setUsername(telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`);
          // Get phone number from Telegram if available
          if (telegramUser.phone_number) {
            setPhone(telegramUser.phone_number);
          }
        } else {
          // Fallback
          setName('Пользователь');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setName('Пользователь');
      }
    };

    loadUserData();
  }, []);

  const userShop = shops.find(shop => shop.userId === MOCK_USER_ID);

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      type: 'person',
      storeName: '',
      storeDescription: '',
      agreement: false,
    },
  });
  const sellerType = sellerForm.watch('type');

  const onSellerSubmit = async (data: SellerFormValues) => {
    try {
      const { agreement, ...sellerData } = data;
      await registerAsSeller(sellerData);

      // Reload user data to update isSeller flag
      await refreshData();

      toast({
        title: 'Поздравляем!',
        description: 'Вы успешно зарегистрированы как продавец.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось зарегистрироваться. Попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };

  const handleTopUpBalance = () => {
    setShowTopUp(true);
  };

  const handleTopUpSuccess = () => {
    setShowTopUp(false);
    toast({
      title: 'Платеж создан',
      description: 'Откройте страницу оплаты для завершения.',
    });
  };

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile({ name, phone });
      await refreshData();
      toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные успешно сохранены.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить профиль.',
        variant: 'destructive',
      });
    }
  };

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
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Telegram username</Label>
              <Input
                id="username"
                value={username}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile}>Сохранить изменения</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-6 w-6" />
            Тема оформления
          </CardTitle>
          <CardDescription>
            Выберите светлую, темную или системную тему.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
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
              <Button className="flex-1" onClick={handleTopUpBalance}>
                <Plus className="mr-2 h-4 w-4" />
                Пополнить
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled
                title="Скоро появится"
              >
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
                <FormField
                  control={sellerForm.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Я принимаю{' '}
                          <Link
                            href="/terms/sellers"
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            правила для продавцов
                          </Link>
                          .
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sellerForm.formState.isSubmitting}
                >
                  Зарегистрироваться
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {/* Dialog для пополнения баланса */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Пополнение баланса</DialogTitle>
            <DialogDescription>
              Выберите сумму и завершите оплату через ЮKassa
            </DialogDescription>
          </DialogHeader>
          <TopUpBalance onSuccess={handleTopUpSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
