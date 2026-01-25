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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import TopUpBalance from '@/components/top-up-balance';
import type { ServiceType, LegalStatus } from '@/lib/types';
import { serviceTypesList } from '@/lib/types';
import { YAKUTIA_CITIES, type YakutiaCity } from '@/lib/cities';
import { getTelegramWebApp } from '@/lib/telegram';
import {
  Store,
  CheckCircle,
  ArrowRight,
  Wallet,
  Plus,
  Paintbrush,
  UserCog,
  Car,
} from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    agreement: z.boolean().refine(val => val === true, {
      message: 'Вы должны принять правила для продавцов.',
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

const driverFormSchema = z.object({
  name: z.string().min(3, 'Имя должно быть длиннее 3 символов.'),
  vehicle: z.string().min(5, 'Укажите модель и марку автомобиля.'),
  services: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Вы должны выбрать хотя бы одну услугу.',
  }),
  legalStatus: z.enum(['Самозанятый', 'ИП'], {
    required_error: 'Пожалуйста, выберите ваш юридический статус.',
  }),
  agreement: z.boolean().refine(val => val === true, {
    message: 'Вы должны принять условия использования.',
  }),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function ProfilePage() {
  const MOCK_USER_ID = 'self'; // In a real app, this would come from auth.
  const {
    isSeller,
    registerAsSeller,
    shops,
    sellerProfile,
    isDriver,
    driverProfile,
    registerAsDriver,
    refreshData
  } = useAppContext();
  const { toast } = useToast();
  const [showTopUp, setShowTopUp] = useState(false);
  const [name, setName] = useState('Загрузка...');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<YakutiaCity>('Якутск');
  const [customCity, setCustomCity] = useState('');

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

  const driverForm = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: '',
      vehicle: '',
      services: [],
      agreement: false,
    },
  });

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

  const onDriverSubmit = async (data: DriverFormValues) => {
    try {
      const { agreement, ...driverData } = data;
      await registerAsDriver({
        ...driverData,
        services: driverData.services as ServiceType[],
        legalStatus: driverData.legalStatus as LegalStatus,
      });

      // Reload user data to update isDriver flag
      await refreshData();

      toast({
        title: 'Вы стали водителем!',
        description: 'Теперь вы можете принимать заказы.',
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

  const requestPhoneNumber = () => {
    const webApp = getTelegramWebApp();
    if (webApp && webApp.requestContact) {
      toast({
        title: 'Запрос номера',
        description: 'Telegram попросит вас поделиться номером телефона',
      });

      // Note: requestContact is available in Telegram Bot API 6.9+
      // The phone will be available in telegramUser.phone_number after sharing
      webApp.requestContact((shared) => {
        if (shared) {
          const telegramUser = getTelegramUser();
          if (telegramUser?.phone_number) {
            setPhone(telegramUser.phone_number);
            toast({
              title: 'Спасибо!',
              description: 'Номер телефона получен',
            });
          }
        }
      });
    } else {
      toast({
        title: 'Недоступно',
        description: 'Эта функция доступна только в Telegram',
        variant: 'destructive',
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const selectedCity = city === 'Другой' ? customCity : city;
      await api.updateProfile({ name, phone, city: selectedCity });
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
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestPhoneNumber}
                >
                  Запросить из Telegram
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Нажмите кнопку, чтобы безопасно получить номер из Telegram
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Ваш город</Label>
              <Select value={city} onValueChange={(value) => setCity(value as YakutiaCity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {YAKUTIA_CITIES.map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {city === 'Другой' && (
                <Input
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Введите название вашего города"
                  className="mt-2"
                />
              )}
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
                              placeholder={`г. ${city === 'Другой' ? customCity || 'Ваш город' : city}, ул. Ленина, 1`}
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

      {/* Driver Registration Section */}
      {isDriver ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              Профиль водителя
            </CardTitle>
            <CardDescription>Вы зарегистрированы как водитель</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Статус водителя: Активен</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Управляйте своими заказами и настройками на панели водителя.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/driver/dashboard" className="w-full">
              <Button className="w-full">
                Перейти к заказам
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              Стать водителем
            </CardTitle>
            <CardDescription>
              Заполните форму, чтобы начать принимать заказы.
            </CardDescription>
          </CardHeader>
          <Form {...driverForm}>
            <form onSubmit={driverForm.handleSubmit(onDriverSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={driverForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваше имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Петров" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={driverForm.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваш автомобиль</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Например, Toyota Camry"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={driverForm.control}
                  name="legalStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Юридический статус</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Самозанятый" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Самозанятый
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="ИП" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              ИП (Индивидуальный предприниматель)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={driverForm.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Какие услуги вы оказываете?
                        </FormLabel>
                        <FormDescription>
                          Выберите одну или несколько категорий.
                        </FormDescription>
                      </div>
                      {serviceTypesList.map(item => (
                        <FormField
                          key={item}
                          control={driverForm.control}
                          name="services"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={driverForm.control}
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
                            href="/terms/drivers"
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            условия использования
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
                  disabled={driverForm.formState.isSubmitting}
                >
                  Стать водителем
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
