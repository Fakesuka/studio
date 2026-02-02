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
import { RoleSwitcher } from '@/components/role-switcher';
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
import React, { useState, useEffect, useMemo } from 'react';
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
import { serviceTypesList, type ServiceType, type LegalStatus, type DriverProfile } from '@/lib/types';
import type { UserRole } from '@/components/role-switcher';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  fromUser?: {
    name?: string;
    avatarUrl?: string;
  };
}

// Profile stats component
function ProfileStats({
  currentRole,
  driverProfile,
  canOpenReviews,
  onRatingClick,
}: {
  currentRole: UserRole;
  driverProfile: DriverProfile | null;
  canOpenReviews: boolean;
  onRatingClick?: () => void;
}) {
  const { orders } = useAppContext();

  // Calculate completed orders count
  const completedOrders = (orders || []).filter(o => o.status === 'Завершён').length;

  // Calculate days since first order or registration (mock for now)
  const daysSinceStart = useMemo(() => {
    const firstOrder = (orders || []).sort((a, b) =>
      new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    )[0];
    if (firstOrder?.date) {
      const days = Math.floor((Date.now() - new Date(firstOrder.date).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, days);
    }
    return 1;
  }, [orders]);

  // Rating (mock for now - would come from API)
  const rating = driverProfile ? 4.98 : 5.0;

  const stats = [
    { label: 'Рейтинг', value: rating.toFixed(2), icon: Star, color: 'text-yellow-400' },
    { label: 'Заказы', value: completedOrders.toString(), icon: Snowflake, color: 'text-neon-cyan' },
    { label: 'Дней', value: daysSinceStart.toString(), icon: Clock, color: 'text-neon-purple' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => {
        const isRating = stat.label === 'Рейтинг';
        const content = (
          <>
            <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
            <span className="text-lg font-bold text-white">{stat.value}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</span>
          </>
        );

        if (isRating && canOpenReviews) {
          return (
            <button
              key={i}
              type="button"
              onClick={onRatingClick}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition hover:bg-white/10"
            >
              {content}
            </button>
          );
        }

        return (
          <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            {content}
          </div>
        );
      })}
    </div>
  );
}

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
    currentRole,
    setCurrentRole,
  } = useAppContext();
  const { toast } = useToast();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<YakutiaCity | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

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
        if (profile.avatarUrl) {
          console.log('[Profile] Setting avatar from API:', profile.avatarUrl);
          setAvatarUrl(profile.avatarUrl);
          setAvatarPreview(profile.avatarUrl);
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
        if (!profile.city) {
          setCity('Якутск');
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
        if (!city) {
          setCity('Якутск');
        }
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadUserData();
  }, []);

  const userShop = (shops || []).find(shop => shop.userId === userId);
  const canOpenReviews = isSeller || isDriver;

  const handleOpenReviews = async () => {
    if (!canOpenReviews) return;
    setIsReviewsOpen(true);
    setIsReviewsLoading(true);
    try {
      const data = await api.getMyReviews() as { reviews?: Review[] };
      setReviews(data.reviews || []);
    } catch (error) {
      logError('[Profile] Error loading reviews:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отзывы.',
        variant: 'destructive',
      });
    } finally {
      setIsReviewsLoading(false);
    }
  };

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

    if (typeof webApp.requestContact !== 'function') {
      toast({
        title: 'Недоступно',
        description: 'Telegram не поддерживает запрос контакта в этой версии.',
        variant: 'destructive',
      });
      return;
    }

    console.log('[Profile] Phone not in user data, requesting via requestContact');
    // If not available, request it
    webApp.requestContact(async (contactShared: boolean | { phone_number?: string }) => {
      console.log('[Profile] Contact shared:', contactShared);
      if (contactShared) {
        if (typeof contactShared === 'object' && 'phone_number' in contactShared) {
          const phoneNumber = (contactShared as { phone_number?: string }).phone_number;
          if (phoneNumber) {
            setPhone(phoneNumber);
          }
        }
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
      const avatarToSave = avatarPreview || avatarUrl;
      const profileData = {
        name,
        phone,
        city: selectedCity,
        ...(avatarToSave ? { avatarUrl: avatarToSave } : {}),
      };
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

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setAvatarPreview(dataUri);
      setAvatarUrl(dataUri);
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
        <RoleSwitcher
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          isDriver={isDriver}
        />
      </div>

      {/* Avatar Hub (Ice Version) */}
      <div className="flex flex-col items-center justify-center -mt-2">
        <div className="relative mb-4 group cursor-pointer">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
          <div className="relative h-28 w-28 p-[3px] rounded-full bg-gradient-to-br from-neon-cyan via-white/50 to-neon-purple">
            <div className="h-full w-full rounded-full border-4 border-black overflow-hidden relative">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={
                    avatarPreview ||
                    avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
                  }
                />
                <AvatarFallback>YG</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className={`absolute bottom-1 right-1 h-8 w-8 bg-black rounded-full flex items-center justify-center border shadow-[0_0_10px_rgba(34,211,238,0.5)] ${currentRole === 'driver' ? 'border-neon-purple' : 'border-neon-cyan'}`}>
            {currentRole === 'driver' ? (
              <Car className="h-4 w-4 text-neon-purple" />
            ) : (
              <User className="h-4 w-4 text-neon-cyan" />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {name}
        </h2>
        <p className="text-gray-400 text-sm">{city === 'Другой' ? customCity : city}</p>
        <div className="mt-3">
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-neon-cyan hover:bg-white/10"
          >
            Загрузить фото
          </label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Stats Row */}
      <ProfileStats
        currentRole={currentRole}
        driverProfile={driverProfile}
        canOpenReviews={canOpenReviews}
        onRatingClick={handleOpenReviews}
      />

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
                placeholder={isProfileLoading ? 'Загрузка...' : 'Ваше имя'}
                disabled={isProfileLoading}
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
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M21.9 4.2c.2.1.3.4.2.6l-3.4 16c0 .2-.2.3-.4.3-.1 0-.2 0-.3-.1l-4.9-3.4-2.5 2.4c-.1.1-.2.1-.3.1h-.1c-.2 0-.3-.2-.3-.4l.2-3.4L18.3 7c.1-.1.1-.3 0-.4-.1-.1-.3-.1-.4 0L7.9 13.1l-4.8-1.5c-.2 0-.3-.2-.3-.4 0-.2.1-.4.3-.4L21.4 4c.2-.1.4 0 .5.2Z" />
                  </svg>
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
                  disabled={isProfileLoading}
                >
                  {isProfileLoading && (
                    <option value="" className="bg-black text-white">
                      Загрузка...
                    </option>
                  )}
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
            <IceCard variant="hot" className="p-4 flex items-center">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange shadow-[0_0_10px_rgba(255,100,0,0.3)]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Продавец</h4>
                  <p className="text-xs text-green-400">Статус активен</p>
                </div>
              </div>
            </IceCard>
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
            <IceCard variant="crystal" className="p-4 flex items-center mt-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Водитель</h4>
                  <p className="text-xs text-green-400">Статус активен</p>
                </div>
              </div>
            </IceCard>
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
                  <User className="h-4 w-4" />
                </div>
                <span className="text-red-500 group-hover:text-red-400 transition-colors text-sm font-medium">Удалить мой профиль</span>
              </div>
            </div>
          </IceCard>
        </div>
      </div>

      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Отзывы</DialogTitle>
            <DialogDescription>
              Отзывы о вас как исполнителе или продавце.
            </DialogDescription>
          </DialogHeader>
          {isReviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{review.fromUser?.name || 'Пользователь'}</span>
                    <span className="text-neon-cyan">{review.rating.toFixed(1)}★</span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-400">{review.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Пока нет отзывов.</p>
          )}
        </DialogContent>
      </Dialog>

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
