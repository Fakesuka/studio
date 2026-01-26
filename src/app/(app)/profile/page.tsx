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

// Вспомогательная функция для очистки данных
function cleanData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item)).filter(item => item !== undefined && item !== null);
  }
  
  if (typeof data === 'object') {
    // Преобразуем Date в строку
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Обрабатываем File/Blob
    if (data instanceof File || data instanceof Blob) {
      return {
        name: data.name,
        type: data.type,
        size: data.size,
        lastModified: data.lastModified,
        _type: 'FileInfo'
      };
    }
    
    // Пропускаем функции
    if (typeof data === 'function') {
      return undefined;
    }
    
    // Для DOM элементов
    if (data.nodeType !== undefined || data instanceof HTMLElement) {
      return undefined;
    }
    
    // Для React рефов
    if (data.current !== undefined) {
      return undefined;
    }
    
    // Рекурсивно очищаем объект
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      
      const cleanedValue = cleanData(value);
      if (cleanedValue !== undefined) {
        result[key] = cleanedValue;
      }
    }
    
    return result;
  }
  
  // Примитивные типы оставляем как есть
  return data;
}

export default function ProfilePage() {
  const MOCK_USER_ID = 'self';
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[Profile] Loading user data from API');
        // Загружаем профиль из API
        const profile = await api.getProfile() as any;
        console.log('[Profile] Profile loaded from API:', profile);

        // Очищаем данные от возможных несериализуемых значений
        const cleanedProfile = cleanData(profile);
        
        if (cleanedProfile?.name) {
          console.log('[Profile] Setting name from API:', cleanedProfile.name);
          setName(String(cleanedProfile.name));
        }
        if (cleanedProfile?.phone) {
          console.log('[Profile] Setting phone from API:', cleanedProfile.phone);
          setPhone(String(cleanedProfile.phone));
        }
        if (cleanedProfile?.city) {
          console.log('[Profile] Setting city from API:', cleanedProfile.city);
          setCity(cleanedProfile.city as YakutiaCity);
        }

        // Получаем данные из Telegram WebApp
        console.log('[Profile] Getting Telegram user data');
        const telegramUser = getTelegramUser();
        console.log('[Profile] Telegram user:', JSON.stringify(telegramUser, null, 2));

        if (telegramUser) {
          const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
          if (!profile?.name) {
            console.log('[Profile] Using Telegram name:', fullName);
            setName(fullName);
          }
          const usernameStr = telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`;
          console.log('[Profile] Setting username:', usernameStr);
          setUsername(usernameStr);

          if (telegramUser.phone_number && !profile?.phone) {
            console.log('[Profile] Using Telegram phone:', telegramUser.phone_number);
            setPhone(telegramUser.phone_number);
          }
        }
        console.log('[Profile] User data loaded successfully');
      } catch (error) {
        console.error('[Profile] Error loading user data:', error);
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
      console.log('Seller registration form data:', data);
      const { agreement, ...sellerData } = data;
      console.log('Sending seller registration payload:', sellerData);

      await registerAsSeller(sellerData);
      await refreshData();

      toast({
        title: 'Поздравляем!',
        description: 'Вы успешно зарегистрированы как продавец.',
      });
    } catch (error) {
      console.error('Seller registration error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться. Попробуйте еще раз.',
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
      await refreshData();

      toast({
        title: 'Вы стали водителем!',
        description: 'Теперь вы можете принимать заказы.',
      });
    } catch (error) {
      console.error('Driver registration error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться. Попробуйте еще раз.',
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
    webApp.requestContact((contactShared) => {
      console.log('[Profile] Contact shared:', contactShared);
      if (contactShared) {
        const updatedUser = webApp.initDataUnsafe?.user;
        console.log('[Profile] Updated user data:', JSON.stringify(updatedUser, null, 2));

        if (updatedUser?.phone_number) {
          console.log('[Profile] Phone now available:', updatedUser.phone_number);
          setPhone(updatedUser.phone_number);
          toast({
            title: 'Номер получен',
            description: 'Номер телефона из вашего профиля Telegram',
          });
        } else {
          console.warn('[Profile] Phone still not available after share');
          webApp.showAlert('Чтобы получить номер телефона, пожалуйста, добавьте его в настройки Telegram');
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
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const selectedCity = city === 'Другой' ? customCity : city;
      
      // Создаем абсолютно чистый объект с проверкой типов
      const profileData: Record<string, string> = {};
      
      if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (trimmedName) profileData.name = trimmedName;
      }
      
      if (typeof phone === 'string') {
        const trimmedPhone = phone.trim();
        if (trimmedPhone) profileData.phone = trimmedPhone;
      }
      
      if (typeof selectedCity === 'string') {
        const trimmedCity = selectedCity.trim();
        if (trimmedCity) profileData.city = trimmedCity;
      }
      
      console.log('Saving profile data (cleaned):', profileData);
      
      // Проверяем, есть ли данные для сохранения
      if (Object.keys(profileData).length === 0) {
        toast({
          title: 'Нет изменений',
          description: 'Нечего сохранять',
          variant: 'destructive',
        });
        return;
      }
      
      // Проверка сериализуемости
      try {
        const testSerialization = JSON.stringify(profileData);
        console.log('✅ Данные сериализуемы, размер:', testSerialization.length, 'bytes');
      } catch (jsonError) {
        console.error('❌ Ошибка сериализации:', jsonError);
        
        // Создаем гарантированно чистые данные
        const guaranteedData = {
          name: String(name || ''),
          phone: String(phone || ''),
          city: String(selectedCity || ''),
        };
        
        // Удаляем пустые поля
        Object.keys(guaranteedData).forEach(key => {
          if (!guaranteedData[key as keyof typeof guaranteedData]) {
            delete guaranteedData[key as keyof typeof guaranteedData];
          }
        });
        
        console.log('Отправляем гарантированно чистые данные:', guaranteedData);
        await api.updateProfile(guaranteedData);
        await refreshData();
        
        toast({
          title: 'Профиль обновлен',
          description: 'Ваши данные успешно сохранены.',
        });
        return;
      }
      
      // Отправляем данные
      await api.updateProfile(profileData);
      await refreshData();

      toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные успешно сохранены.',
      });
      
    } catch (error) {
      console.error('Profile save error:', error);
      
      // Подробное логирование ошибки
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Проверяем на ошибку сериализации
        const errorStr = String(error.message).toLowerCase();
        if (errorStr.includes('circular') || 
            errorStr.includes('json') || 
            errorStr.includes('stringify') ||
            errorStr.includes('serial')) {
          console.error('⚠️ Обнаружена ошибка сериализации JSON');
          
          // Пытаемся отправить только строки
          const stringData = {
            name: String(name),
            phone: String(phone),
            city: String(city === 'Другой' ? customCity : city)
          };
          
          try {
            console.log('Пытаемся отправить данные как строки:', stringData);
            await api.updateProfile(stringData);
            await refreshData();
            toast({
              title: 'Профиль обновлен',
              description: 'Данные сохранены (исправлена ошибка формата).',
            });
            return;
          } catch (retryError) {
            console.error('Повторная попытка также не удалась:', retryError);
          }
        }
      }
      
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить профиль.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
                  readOnly
                  disabled
                  placeholder="Нажмите кнопку для получения номера"
                  className="flex-1 bg-muted"
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
                Номер телефона можно получить только из Telegram для безопасности
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
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
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

            {isSeller && userShop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Ваш магазин
            </CardTitle>
            <CardDescription>
              Управление вашим магазином
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Контент магазина */}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ProfilePage;
