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


  return (
    <div className="flex flex-col gap-6 relative pb-24">
      {/* Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[150px] rounded-full" />
      </div>

      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Profile</h1>
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
          User {userId.slice(0, 4)}
          <Badge variant="secondary" className="bg-white/10 text-neon-cyan border-neon-cyan/20 backdrop-blur-md">PRO</Badge>
        </h2>
        <p className="text-gray-400 text-sm">Yakutsk, Russia</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Rating', value: '4.98', icon: Star, color: 'text-yellow-400' },
          { label: 'Orders', value: '124', icon: Snowflake, color: 'text-neon-cyan' },
          { label: 'Days', value: '365', icon: Clock, color: 'text-neon-purple' },
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
            <p className="text-blue-200/60 text-sm font-medium mb-1">Total Balance</p>
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
            <Plus className="h-4 w-4 mr-2" /> Top Up
          </FrostButton>
          <FrostButton size="sm" variant="default" className="flex-1 bg-white/10 hover:bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </FrostButton>
        </div>
      </IceCard>

      {/* Settings Groups */}
      <div className="space-y-6">

        {/* Account */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">Account</h3>
          <IceCard className="flex flex-col divide-y divide-white/5">
            {[
              { icon: User, label: 'Personal Information' },
              { icon: ShieldCheck, label: 'Login & Security' },
              { icon: MapPin, label: 'Saved Addresses' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-neon-cyan transition-colors">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-200 text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </IceCard>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">Roles</h3>

          {/* Seller Status */}
          {isSeller ? (
            <Link href="/my-store" className="block">
              <IceCard variant="hot" className="p-4 flex items-center justify-between hover:border-neon-orange/60 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange shadow-[0_0_10px_rgba(255,100,0,0.3)]">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Seller Dashboard</h4>
                    <p className="text-xs text-orange-400/80">Manage your shop</p>
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
                <span className="text-gray-400 text-sm">Become a Seller</span>
              </div>
              <FrostButton size="sm" variant="ghost" className="text-xs text-neon-cyan h-8" onClick={() => document.getElementById('seller-trigger')?.click()}>
                Apply
              </FrostButton>
            </IceCard>
          )}

          {/* Driver Status */}
          {isDriver ? (
            <Link href="/driver/dashboard" className="block mt-2">
              <IceCard variant="crystal" className="p-4 flex items-center justify-between hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Driver Mode</h4>
                    <p className="text-xs text-blue-400/80">Switch to Driver App</p>
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
                <span className="text-gray-400 text-sm">Become a Driver</span>
              </div>
              <FrostButton size="sm" variant="ghost" className="text-xs text-blue-400 h-8" onClick={() => setShowDriverForm(true)}>
                Apply
              </FrostButton>
            </IceCard>
          )}
        </div>

        {/* App Settings */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-widest px-2">App Settings</h3>
          <IceCard className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400">
                  <Paintbrush className="h-4 w-4" />
                </div>
                <span className="text-gray-200 text-sm font-medium">Dark Mode Only</span>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-red-500 group-hover:text-red-400 transition-colors text-sm font-medium">Log Out</span>
              </div>
            </div>
          </IceCard>
        </div>
      </div>

      {/* Dialog for Driver Registration */}
      <Dialog open={showDriverForm} onOpenChange={setShowDriverForm}>
        <DialogContent className="max-w-lg bg-black/90 backdrop-blur-3xl border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Become a Driver</DialogTitle>
            <DialogDescription>
              Join our fleet and start earning money.
            </DialogDescription>
          </DialogHeader>
          <Form {...driverForm}>
            <form onSubmit={driverForm.handleSubmit(onDriverSubmit)} className="space-y-4">
              <FormField
                control={driverForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10" />
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
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota Camry" {...field} className="bg-white/5 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* ... (Rest of the form logic is fine, just needs minor styling for inputs if not global) */}
              <FormField
                control={driverForm.control}
                name="legalStatus"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Legal Status</FormLabel>
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
                            Self-employed
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ИП" className="border-white/20 text-neon-cyan" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-300">
                            Individual Entrepreneur (IP)
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
                      <FormLabel className="text-base">Services</FormLabel>
                      <FormDescription>
                        Select the services you provide.
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
                        I agree to the terms
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FrostButton type="submit" className="w-full" variant="primary" disabled={driverForm.formState.isSubmitting}>
                Register as Driver
              </FrostButton>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Top Up */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="max-w-md bg-black/90 backdrop-blur-3xl border-white/10">
          <DialogHeader>
            <DialogTitle>Top Up Balance</DialogTitle>
            <DialogDescription>
              Select amount to top up.
            </DialogDescription>
          </DialogHeader>
          <TopUpBalance onSuccess={handleTopUpSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
