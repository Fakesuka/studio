'use client';

import {
  User,
  Settings,
  CreditCard,
  ChevronRight,
  LogOut,
  ShieldCheck,
  MapPin,
  Car,
  Star,
  Clock,
  Paintbrush,
  Wallet,
  MoreHorizontal,
  Snowflake,
  Plus,
  Store,
  ArrowRight,
  Shield,
  Bell,
  UserCog
} from 'lucide-react';
import { FrostButton } from '@/components/ui/frost-button';
import { IceCard } from '@/components/ui/ice-card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { getCurrentUserId } from '@/lib/user-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TopUpBalance from '@/components/top-up-balance';
import { getTelegramWebApp, getTelegramPhoneNumber, getTelegramUser } from '@/lib/telegram';
import { safeErrorLog, getErrorMessage, logError } from '@/lib/error-utils';
import { api } from '@/lib/api';
import { YAKUTIA_CITIES, type YakutiaCity } from '@/lib/cities';
import { serviceTypesList, type ServiceType, type LegalStatus } from '@/lib/types';

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
  const userId = getCurrentUserId();
  const {
    isSeller,
    registerAsSeller,
    shops,
    sellerProfile,
    isDriver,
    driverProfile,
    registerAsDriver,
    refreshData,
    balance,
  } = useAppContext();
  const { toast } = useToast();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [name, setName] = useState('Загрузка...');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<YakutiaCity>('Якутск');
  const [customCity, setCustomCity] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Profile] Loading user data from API');
        // Load profile from API first
        const profile = await api.getProfile() as any;
        console.log('[Profile] Profile loaded from API:', profile);

        if (profile.name) {
          console.log('[Profile] Setting name from API:', profile.name);
          setName(profile.name);
        }
        if (profile.phone) {
          console.log('[Profile] Setting phone from API:', profile.phone);
          setPhone(profile.phone);
        }
        if (profile.city) {
          console.log('[Profile] Setting city from API:', profile.city);
          setCity(profile.city as YakutiaCity);
        }

        // Get data from Telegram WebApp
        console.log('[Profile] Getting Telegram user data');
        const telegramUser = getTelegramUser();
        console.log('[Profile] Telegram user:', JSON.stringify(telegramUser, null, 2));

        if (telegramUser) {
          const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
          if (!profile.name) {
            console.log('[Profile] Using Telegram name:', fullName);
            setName(fullName);
          }
          const usernameStr = telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`;
          console.log('[Profile] Setting username:', usernameStr);
          setUsername(usernameStr);

          // Get phone number from Telegram if available
          const telegramPhone = telegramUser.phone_number || getTelegramPhoneNumber();
          if (telegramPhone && !profile.phone) {
            console.log('[Profile] Using Telegram phone:', telegramPhone);
            setPhone(telegramPhone);
          }
        }
        console.log('[Profile] User data loaded successfully');
      } catch (error) {
        logError('[Profile] Error loading user data:', error);
        const telegramUser = getTelegramUser();
        if (telegramUser) {
          const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
          console.log('[Profile] Fallback to Telegram data:', fullName);
          setName(fullName);
          setUsername(telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`);
        } else {
          console.log('[Profile] No Telegram data, using default');
          setName('Пользователь');
        }
      }
    };

    loadUserData();
  }, []);

  const userShop = (shops || []).find(shop => shop.userId === userId);

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
      console.log('Seller registration form data:', data);
      const { agreement, ...sellerData } = data;
      console.log('Sending seller registration payload:', sellerData);

      await registerAsSeller(sellerData);

      // Reload user data to update isSeller flag
      await refreshData();

      toast({
        title: 'Поздравляем!',
        description: 'Вы успешно зарегистрированы как продавец.',
      });
    } catch (error) {
      logError('[Profile] Seller registration error:', error);
      toast({
        title: 'Ошибка',
        description: getErrorMessage(error, 'Не удалось зарегистрироваться. Попробуйте еще раз.'),
        variant: 'destructive',
      });
    }
  };

  const onDriverSubmit = async (data: DriverFormValues) => {
    try {
      console.log('Driver registration form data:', data);
      const { agreement, ...driverData } = data;
      const payload = {
        ...driverData,
        services: driverData.services as ServiceType[],
        legalStatus: driverData.legalStatus as LegalStatus,
      };
      console.log('Sending driver registration payload:', payload);

      await registerAsDriver(payload);

      // Reload user data to update isDriver flag
      await refreshData();

      toast({
        title: 'Вы стали водителем!',
        description: 'Теперь вы можете принимать заказы.',
      });
    } catch (error) {
      logError('[Profile] Driver registration error:', error);
      toast({
        title: 'Ошибка',
        description: getErrorMessage(error, 'Не удалось зарегистрироваться. Попробуйте еще раз.'),
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
    console.log('[Profile] Requesting phone number from Telegram');
    const webApp = getTelegramWebApp();

    if (!webApp) {
      console.error('[Profile] WebApp not available');
      toast({
        title: 'Недоступно',
        description: 'Функция доступна только в Telegram',
        variant: 'destructive',
      });
      return;
    }

    console.log('[Profile] WebApp available, checking user data');
    const user = webApp.initDataUnsafe?.user;
    console.log('[Profile] User object:', JSON.stringify(user, null, 2));

    // Try to get phone directly from user data
    if (user?.phone_number) {
      console.log('[Profile] Phone found in user data:', user.phone_number);
      setPhone(user.phone_number);
      toast({
        title: 'Номер получен',
        description: 'Номер телефона из вашего профиля Telegram',
      });
      return;
    }

    console.log('[Profile] Phone not in user data, requesting via requestContact');
    // If not available, request it
    webApp.requestContact(async (contactShared) => {
      console.log('[Profile] Contact shared:', contactShared);
      if (contactShared) {
        // Contact was shared and sent to bot
        // Wait a moment for the bot to process and save to database
        toast({
          title: 'Обработка...',
          description: 'Получаем номер телефона из Telegram',
        });

        // Give bot time to process the contact message
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          // Fetch updated profile from API (bot saves phone to database)
          console.log('[Profile] Fetching updated profile from API');
          const updatedProfile = await api.getProfile() as any;
          console.log('[Profile] Updated profile:', updatedProfile);

          if (updatedProfile.phone) {
            console.log('[Profile] Phone now available from API:', updatedProfile.phone);
            setPhone(updatedProfile.phone);
            toast({
              title: 'Номер получен',
              description: 'Номер телефона успешно сохранен',
            });
          } else {
            // Try once more after additional delay
            console.log('[Profile] Phone not yet in DB, retrying...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryProfile = await api.getProfile() as any;

            if (retryProfile.phone) {
              setPhone(retryProfile.phone);
              toast({
                title: 'Номер получен',
                description: 'Номер телефона успешно сохранен',
              });
            } else {
              console.warn('[Profile] Phone still not available after retry');
              toast({
                title: 'Номер отправлен',
                description: 'Обновите страницу через несколько секунд',
              });
            }
          }
        } catch (error) {
          logError('[Profile] Error fetching updated profile:', error);
          toast({
            title: 'Номер отправлен',
            description: 'Перезагрузите страницу для обновления данных',
          });
        }
      } else {
        console.log('[Profile] User cancelled contact sharing');
        toast({
          title: 'Отменено',
          description: 'Запрос номера отменен',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSaveProfile = async () => {
    try {
      const selectedCity = city === 'Другой' ? customCity : city;
      const profileData = { name, phone, city: selectedCity };
      console.log('Saving profile data:', profileData);

      await api.updateProfile(profileData);
      await refreshData();

      toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные успешно сохранены.',
      });
    } catch (error) {
      logError('[Profile] Save error:', error);
      toast({
        title: 'Ошибка',
        description: getErrorMessage(error, 'Не удалось сохранить профиль.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 relative pb-24">
      {/* Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[150px] rounded-full" />
      </div>

      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Профиль</h1>
        <FrostButton variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5 text-gray-400" />
        </FrostButton>
      </div>

      {/* Avatar Hub (Ice Version) */}
      <div className="flex flex-col items-center justify-center -mt-2">
        <div className="relative mb-4 group cursor-pointer">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
          <div className="relative h-28 w-28 p-[3px] rounded-full bg-gradient-to-br from-neon-cyan via-white/50 to-neon-purple">
            <div className="h-full w-full rounded-full border-4 border-black overflow-hidden relative">
              <Avatar className="h-full w-full">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} />
                <AvatarFallback>YG</AvatarFallback>
              </Avatar>
            </div>
          </div>
          {isDriver && (
            <div className="absolute bottom-1 right-1 h-8 w-8 bg-black rounded-full flex items-center justify-center border border-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              <Car className="h-4 w-4 text-neon-cyan" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {name}
        </h2>
        <p className="text-gray-400 text-sm">{city === 'Другой' ? customCity : city}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Рейтинг', value: '4.98', icon: Star, color: 'text-yellow-400' },
          { label: 'Заказы', value: '124', icon: Snowflake, color: 'text-neon-cyan' },
          { label: 'Дней', value: '365', icon: Clock, color: 'text-neon-purple' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
            <span className="text-lg font-bold text-white">{stat.value}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Wallet Card (3D Ice) */}
      <IceCard variant="crystal" className="relative overflow-hidden min-h-[160px] flex flex-col justify-between p-6 group">
        <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-neon-cyan/20 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-blue-200/60 text-sm font-medium mb-1">Кошелёк</p>
            <h3 className="text-4xl font-mono font-bold text-white tracking-tighter shadow-neon-cyan drop-shadow-lg">
              {balance.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} <span className="text-2xl text-neon-cyan">₽</span>
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex gap-3 mt-4 relative z-10">
          <FrostButton size="sm" variant="primary" className="flex-1 shadow-neon-cyan/20" onClick={() => setShowTopUp(true)}>
            <Plus className="h-4 w-4 mr-2" /> Пополнить
          </FrostButton>
          <FrostButton size="sm" variant="default" className="flex-1 bg-white/10 hover:bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </FrostButton>
        </div>
      </IceCard>

      {/* Settings Groups */}
      <div className="space-y-6">

        {/* Личные данные */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">Личные данные</h3>
          <IceCard className="flex flex-col divide-y divide-white/5 p-4 gap-4">
            {/* Имя */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 flex items-center gap-2">
                <User className="h-3 w-3" /> Имя
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-[10px] text-gray-500">Берётся из Telegram, можно изменить</p>
            </div>

            {/* Телефон */}
            <div className="flex flex-col gap-2 pt-4">
              <label className="text-xs text-gray-400 flex items-center gap-2">
                <Shield className="h-3 w-3" /> Номер телефона
              </label>
              <div className="flex gap-2">
                <Input
                  value={phone}
                  readOnly
                  placeholder="Не указан"
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
                <FrostButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={requestPhoneNumber}
                  className="text-neon-cyan"
                >
                  Получить
                </FrostButton>
              </div>
              <p className="text-[10px] text-gray-500">Получается только через Telegram бота</p>
            </div>

            {/* Город */}
            <div className="flex flex-col gap-2 pt-4">
              <label className="text-xs text-gray-400 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Город
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as YakutiaCity)}
                className="bg-white/5 border border-white/10 text-white rounded-md p-2 text-sm"
              >
                {YAKUTIA_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-black text-white">
                    {c}
                  </option>
                ))}
              </select>
              {city === 'Другой' && (
                <Input
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Введите название города"
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              )}
            </div>

            {/* Кнопка сохранения */}
            <div className="pt-4">
              <FrostButton
                variant="primary"
                className="w-full"
                onClick={handleSaveProfile}
              >
                Сохранить
              </FrostButton>
            </div>
          </IceCard>
        </div>

        {/* Роли */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">Роли</h3>

          {/* Статус продавца */}
          {isSeller ? (
            <Link href="/my-store" className="block">
              <IceCard variant="hot" className="p-4 flex items-center justify-between hover:border-neon-orange/60 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange shadow-[0_0_10px_rgba(255,100,0,0.3)]">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Продавец</h4>
                    <p className="text-xs text-green-400">Статус активен</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-orange-500/50" />
              </IceCard>
            </Link>
          ) : (
            <IceCard className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                  <Store className="h-4 w-4" />
                </div>
                <span className="text-gray-400 text-sm">Стать продавцом</span>
              </div>
              <FrostButton size="sm" variant="ghost" className="text-xs text-neon-cyan h-8" onClick={() => setShowSellerForm(true)}>
                Подать заявку
              </FrostButton>
            </IceCard>
          )}

          {/* Статус водителя */}
          {isDriver ? (
            <Link href="/driver/dashboard" className="block mt-2">
              <IceCard variant="crystal" className="p-4 flex items-center justify-between hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Водитель</h4>
                    <p className="text-xs text-green-400">Статус активен</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-blue-500/50" />
              </IceCard>
            </Link>
          ) : (
            <IceCard className="p-4 flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                  <Car className="h-4 w-4" />
                </div>
                <span className="text-gray-400 text-sm">Стать водителем</span>
              </div>
              <FrostButton size="sm" variant="ghost" className="text-xs text-blue-400 h-8" onClick={() => setShowDriverForm(true)}>
                Подать заявку
              </FrostButton>
            </IceCard>
          )}
        </div>

        {/* Настройки */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">Настройки</h3>
          <IceCard className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400">
                  <Paintbrush className="h-4 w-4" />
                </div>
                <span className="text-gray-200 text-sm font-medium">Только тёмная тема</span>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-red-500 group-hover:text-red-400 transition-colors text-sm font-medium">Выйти</span>
              </div>
            </div>
          </IceCard>
        </div>
      </div>

      {/* Dialog for Driver Registration */}
      <Dialog open={showDriverForm} onOpenChange={setShowDriverForm}>
        <DialogContent className="max-w-lg bg-black/90 backdrop-blur-3xl border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Стать водителем</DialogTitle>
            <DialogDescription>
              Присоединяйтесь к нашей команде и начните зарабатывать.
            </DialogDescription>
          </DialogHeader>
          <Form {...driverForm}>
            <form onSubmit={driverForm.handleSubmit(onDriverSubmit)} className="space-y-4">
              <FormField
                control={driverForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваше имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Иванов" {...field} className="bg-white/5 border-white/10" />
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
                    <FormLabel>Модель автомобиля</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota Camry" {...field} className="bg-white/5 border-white/10" />
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
                            <RadioGroupItem value="Самозанятый" className="border-white/20 text-neon-cyan" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-300">
                            Самозанятый
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ИП" className="border-white/20 text-neon-cyan" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-300">
                            Индивидуальный предприниматель (ИП)
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
                      <FormLabel className="text-base">Услуги</FormLabel>
                      <FormDescription>
                        Выберите услуги, которые вы предоставляете.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceTypesList.map((item) => (
                        <FormField
                          key={item}
                          control={driverForm.control}
                          name="services"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-3 bg-white/5"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                    }}
                                    className="border-white/20 data-[state=checked]:bg-neon-cyan data-[state=checked]:text-black"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-xs text-gray-300">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={driverForm.control}
                name="agreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-neon-cyan data-[state=checked]:text-black"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-300">
                        Я принимаю условия использования
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FrostButton type="submit" className="w-full" variant="primary" disabled={driverForm.formState.isSubmitting}>
                Зарегистрироваться
              </FrostButton>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Seller Registration */}
      <Dialog open={showSellerForm} onOpenChange={setShowSellerForm}>
        <DialogContent className="max-w-lg bg-black/90 backdrop-blur-3xl border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Стать продавцом</DialogTitle>
            <DialogDescription>
              Заполните форму для регистрации в качестве продавца.
            </DialogDescription>
          </DialogHeader>
          <Form {...sellerForm}>
            <form onSubmit={sellerForm.handleSubmit(onSellerSubmit)} className="space-y-4">
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
                            <RadioGroupItem value="person" className="border-white/20 text-neon-cyan" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-300">
                            Физическое лицо
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="store" className="border-white/20 text-neon-cyan" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-300">
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
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Название магазина или ваше имя" {...field} className="bg-white/5 border-white/10" />
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
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Input placeholder="Опишите вашу деятельность" {...field} className="bg-white/5 border-white/10" />
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
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Input placeholder="Адрес магазина" {...field} className="bg-white/5 border-white/10" />
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
                          <Input placeholder="09:00 - 18:00" {...field} className="bg-white/5 border-white/10" />
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-neon-cyan data-[state=checked]:text-black"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-300">
                        Я принимаю правила для продавцов
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FrostButton type="submit" className="w-full" variant="primary" disabled={sellerForm.formState.isSubmitting}>
                Зарегистрироваться
              </FrostButton>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Top Up */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="max-w-md bg-black/90 backdrop-blur-3xl border-white/10">
          <DialogHeader>
            <DialogTitle>Пополнить баланс</DialogTitle>
            <DialogDescription>
              Выберите сумму для пополнения.
            </DialogDescription>
          </DialogHeader>
          <TopUpBalance onSuccess={handleTopUpSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
