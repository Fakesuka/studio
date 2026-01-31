'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Flame,
  Fuel,
  Truck,
  Wrench,
  Sparkles,
  Snowflake,
  MapPinned,
  LocateFixed,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  diagnoseProblem,
  type DiagnoseProblemOutput,
} from '@/ai/qwen';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { MapMarker } from '@/components/map-2gis';

const Map2GIS = dynamic(() => import('@/components/map-2gis'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-muted" />,
});

const GIS_API_KEY =
  process.env.NEXT_PUBLIC_2GIS_API_KEY || '1e0bb99c-b88d-4624-974a-63ab8c556c19';

const formSchema = z.object({
  serviceType: z.string({
    required_error: 'Пожалуйста, выберите тип услуги.',
  }),
  location: z.string().min(5, 'Пожалуйста, укажите ваше местоположение.'),
  description: z.string().min(10, 'Пожалуйста, предоставьте больше деталей.'),
  photo: z.any().optional(),
  suggestedPrice: z.coerce
    .number()
    .positive('Цена должна быть положительным числом.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ServiceRequestFormValues = z.infer<typeof formSchema>;

const serviceTypes = [
  { value: 'Отогрев авто', label: 'Отогрев авто', icon: Flame },
  { value: 'Доставка топлива', label: 'Доставка топлива', icon: Fuel },
  { value: 'Техпомощь', label: 'Техпомощь', icon: Wrench },
  { value: 'Эвакуатор', label: 'Эвакуатор', icon: Truck },
];

export function ServiceRequestForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [userCity, setUserCity] = useState('Якутск');
  const { toast } = useToast();
  const router = useRouter();
  const { createServiceRequest } = useAppContext();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');

  const [useWithoutAI, setUseWithoutAI] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<DiagnoseProblemOutput | null>(
    null
  );
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    62.0339,
    129.7331,
  ]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );
  const [selectedAddress, setSelectedAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    // Load user's city from profile
    api.getProfile().then((profile: any) => {
      if (profile.city) {
        setUserCity(profile.city);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => null
    );
  }, []);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
      serviceType:
        serviceParam && serviceTypes.some(s => s.value === serviceParam)
          ? serviceParam
          : undefined,
      suggestedPrice: undefined,
    },
  });

  const descriptionValue = form.watch('description');
  const { setValue } = form;

  useEffect(() => {
    if (useWithoutAI || !descriptionValue || descriptionValue.length < 10) {
      setAiDiagnosis(null);
      return;
    }

    const handler = setTimeout(() => {
      setIsDiagnosing(true);
      setAiDiagnosis(null);

      diagnoseProblem({ description: descriptionValue })
        .then(result => {
          if (result) {
            setAiDiagnosis(result);
            if (result.suggestedService) {
              setValue('serviceType', result.suggestedService, {
                shouldValidate: true,
              });
            }
          }
        })
        .catch(err => {
          console.error('AI Diagnosis failed:', err);
          setAiDiagnosis({
            diagnosis:
              'Не удалось связаться с AI-помощником. Выберите услугу вручную.',
            suggestedService: null,
          });
        })
        .finally(() => {
          setIsDiagnosing(false);
        });
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [descriptionValue, useWithoutAI, setValue]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setPhotoPreview(dataUri);
      form.setValue('photo', dataUri);
    }
  };

  function onSubmit(data: ServiceRequestFormValues) {
    createServiceRequest(data);
    toast({
      title: 'Заявка отправлена!',
      description: 'Мы ищем ближайшего исполнителя.',
    });
    router.push('/dashboard');
  }

  const suggestedServiceLabel = aiDiagnosis?.suggestedService
    ? serviceTypes.find(s => s.value === aiDiagnosis.suggestedService)?.label
    : '';

  const mapMarkers: MapMarker[] = selectedCoords
    ? [
        {
          id: 'selected',
          coords: selectedCoords,
        },
      ]
    : [];

  const reverseGeocode = async ([lat, lng]: [number, number]) => {
    try {
      setIsGeocoding(true);
      const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&key=${GIS_API_KEY}&fields=items.full_name,items.address_name,items.name`;
      const response = await fetch(url);
      if (!response.ok) return '';
      const data = await response.json();
      const address =
        data?.result?.items?.[0]?.full_name ||
        data?.result?.items?.[0]?.address_name ||
        data?.result?.items?.[0]?.name ||
        '';
      return address;
    } catch (error) {
      console.error('Reverse geocode failed:', error);
      return '';
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Новая заявка</CardTitle>
        <CardDescription>
          Опишите проблему, и мы попробуем определить тип услуги.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Опишите проблему подробнее</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Например, машина не заводится, кажется, сел аккумулятор..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={() => (
                <FormItem>
                  <FormLabel>Приложите фото (по желанию)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </FormControl>
                  {photoPreview && (
                    <div className="relative mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-h-40 rounded-md object-cover"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-ai"
                checked={useWithoutAI}
                onCheckedChange={(checked: boolean) => {
                  setUseWithoutAI(checked);
                  if (checked) {
                    setAiDiagnosis(null);
                  }
                }}
              />
              <label
                htmlFor="no-ai"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Я выберу услугу сам
              </label>
            </div>

            {(isDiagnosing || aiDiagnosis) && !useWithoutAI && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {isDiagnosing
                    ? 'Анализ проблемы...'
                    : `Рекомендуемая услуга${
                        suggestedServiceLabel ? `: ${suggestedServiceLabel}` : ''
                      }`}
                  {isDiagnosing && <Snowflake className="h-4 w-4 animate-spin" />}
                </AlertTitle>
                <AlertDescription>
                  {isDiagnosing
                    ? 'Анализируем вашу проблему, чтобы предложить наиболее подходящее решение.'
                    : aiDiagnosis?.diagnosis}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип услуги</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !useWithoutAI &&
                      (isDiagnosing ||
                        (!!aiDiagnosis && !!aiDiagnosis.suggestedService))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип услуги" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Где вы находитесь?</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Например, г. ${userCity}, ул. Ленина, д. 1`}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMapOpen(true)}
                        className="shrink-0"
                      >
                        <MapPinned className="mr-2 h-4 w-4" />
                        Карта
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Можно выбрать точку на карте или ввести адрес вручную.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suggestedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Предлагаемая цена (₽)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Укажите цену, которую вы готовы заплатить за услугу.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Найти исполнителя
            </Button>
          </CardFooter>
        </form>
      </Form>
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="h-[100dvh] w-screen max-w-none p-0 border-0 rounded-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Выбор местоположения</DialogTitle>
            <DialogDescription>
              Выберите точку на карте или введите адрес
            </DialogDescription>
          </DialogHeader>
          <div className="absolute inset-0">
            <Map2GIS
              center={mapCenter}
              zoom={13}
              markers={mapMarkers}
              interactive
              preserveZoom
              onClick={async (coords) => {
                setSelectedCoords(coords);
                const address = await reverseGeocode(coords);
                if (address) {
                  setSelectedAddress(address);
                  setManualAddress(address);
                }
              }}
            />
          </div>
          <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
              <Input
                value={manualAddress || selectedAddress || ''}
                onChange={(event) => setManualAddress(event.target.value)}
                placeholder={isGeocoding ? 'Определяем адрес...' : 'Введите адрес'}
                className="h-10 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full border bg-white dark:bg-slate-800"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    const coords: [number, number] = [
                      position.coords.latitude,
                      position.coords.longitude,
                    ];
                    setMapCenter(coords);
                    setSelectedCoords(coords);
                    const address = await reverseGeocode(coords);
                    if (address) {
                      setSelectedAddress(address);
                      setManualAddress(address);
                    }
                  });
                }}
                aria-label="Определить по геолокации"
              >
                <LocateFixed className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                disabled={!selectedCoords && !manualAddress}
                onClick={() => {
                  const coords = selectedCoords ?? mapCenter;
                  const [lat, lng] = coords;
                  const addressValue =
                    manualAddress ||
                    selectedAddress ||
                    `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                  setValue('location', addressValue, {
                    shouldValidate: true,
                  });
                  setValue('latitude', lat);
                  setValue('longitude', lng);
                  setIsMapOpen(false);
                }}
                aria-label="Подтвердить адрес"
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
