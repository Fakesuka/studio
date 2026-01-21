'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flame, Fuel, Truck, Wrench, Sparkles, Loader2 } from 'lucide-react';
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
import { mockProviders } from '@/lib/data';
import type { ServiceType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  serviceType: z.string({ required_error: 'Пожалуйста, выберите тип услуги.' }),
  location: z.string().min(5, 'Пожалуйста, укажите ваше местоположение.'),
  description: z.string().min(10, 'Пожалуйста, предоставьте больше деталей.'),
  photo: z.any().optional(),
});

type ServiceRequestFormValues = z.infer<typeof formSchema>;

const serviceTypes = [
  { value: 'отогрев', label: 'Отогрев авто', icon: Flame },
  { value: 'доставка топлива', label: 'Доставка топлива', icon: Fuel },
  { value: 'техпомощь', label: 'Техпомощь', icon: Wrench },
  { value: 'эвакуатор', label: 'Эвакуатор', icon: Truck },
];

const serviceTypeValues = [
  'отогрев',
  'доставка топлива',
  'техпомощь',
  'эвакуатор',
] as const;

// Local type for AI diagnosis simulation
type DiagnoseProblemOutput = {
  diagnosis: string;
  suggestedService: (typeof serviceTypeValues)[number] | null;
};

// Keyword-based AI simulation
const simulateAiDiagnosis = (description: string): DiagnoseProblemOutput => {
  const lowerCaseDescription = description.toLowerCase();

  // Priority 1: Evacuator cases (most critical)
  const evacuatorKeywords = new RegExp(
    [
      'не заводится', 'заглох и не заводится', 'серьезная поломка', 'стук в двигателе', 'оборвался ремень грм', 'вода в двигателе', 'гидроудар', 'утонул', 'после дтп', 'авария', 'поврежден', 'не на ходу', 'сломался на трассе', 'поломка коробки передач', 'не включаются передачи', 'сломался мост', 'слетела цепь грм', 'заклинил двигатель', 'задымился', 'пошел дым', 'загорелся', 'пожар в машине', 'перевернулся', 'упал в кювет', 'застрял', 'застрял в грязи', 'застрял в снегу', 'увяз', 'вытащить из грязи', 'вытащить из снега', 'утонул в снегу', 'съехал с дороги', 'застрял на бездорожье', 'упал в яму', 'сломалось колесо', 'отвалилось колесо', 'сорвало баллонку', 'сломался амортизатор', 'сломалась пружина', 'поломка подвески', 'сломался рулевой', 'не работает руль', 'отказ тормозов', 'провалились тормоза', 'сломался кардан', 'не едет задний мост', 'перегрелась акпп', 'не работает полный привод', 'сломался дифференциал', 'нужен спецтранспорт', 'эвакуация авто', 'транспортировка автомобиля', 'услуги эвакуатора'
    ].join('|'),
    'i'
  );
  if (evacuatorKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Обнаружена серьезная неисправность, рекомендуем эвакуатор.',
      suggestedService: 'эвакуатор',
    };
  }

  // Priority 2: Heating issues
  const heatingKeywords = new RegExp(
    [
      'холод', 'замерзла', 'примерзли замки', 'не открывается дверь', 'примерз стеклоомыватель', 'примерзли дворники', 'примерзли тормозные колодки', 'примерз ручник', 'дверь не открывается зимой', 'замок замерз', 'отогреть дверь', 'отогреть замок', 'примерз капот', 'примерз багажник', 'отогрев автомобиля', 'отогреть авто', 'разморозить замок', 'замерзла ручка двери', 'лед в выхлопной', 'замерз глушитель', 'конденсат в замке', 'замерз трос капота', 'отогрев в мороз', 'примерзли диски', 'примерз колесо к асфальту', 'отогреть колесо', 'срочный отогрев', 'выездной отогрев', 'примерзла сигнализация', 'не работает брелок зимой', 'замерзли форсунки', 'замерз топливный фильтр', 'дизель замерз', 'парафинизация солярки', 'отогрев топливной системы', 'лед в бензобаке', 'отогрев двигателя', 'прогрев мотора', 'антифриз замерз', 'отогрев радиатора', 'печка не греет', 'замерзла печка', 'отогреть салон', 'лед в печке', 'отогрев патрубков', 'замерзли стекла', 'лед на стекле', 'примерзли зеркала', 'замерзла жидкость омывателя'
    ].join('|'),
    'i'
  );
  if (heatingKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Симптомы указывают на проблему, связанную с низкой температурой.',
      suggestedService: 'отогрев',
    };
  }

  // Priority 3: Fuel issues
  const fuelKeywords = new RegExp(
    [
      'закончился бензин', 'сел на трассе', 'пустой бак', 'заглох на дороге', 'нет топлива', 'кончилось топливо', 'застрял без бензина', 'бензин на нуле', 'солярка закончилась', 'доставить бензин', 'доставить солярку', 'заправка на месте', 'срочная заправка', 'топливо с доставкой', 'не доехал до заправки', 'забыл заправиться', 'светится лампочка бензобака', 'аварийный запас топлива', 'заказать топливо', 'доставка аи-92', 'доставка аи-95', 'доставка аи-98', 'доставка дизеля', 'доставка дт', 'бензин в канистре', 'срочно нужен бензин', 'помогите с топливом', 'машина встала', 'заглохла на пустой трассе', 'остался без горючки', 'не заводится из-за топлива', 'завоз топлива', 'топливная помощь', 'экстренная заправка', 'выездная заправка', 'помпа для топлива', 'канистра с бензином', 'залили не то топливо', 'нужна промывка бака', 'доставка ночью', 'доставка в поле', 'доставка в лес', 'доставка в промзону', 'доставка в час пик', 'сервис доставки топлива', 'помощь водителю', 'топливный гол', 'кончилась солярка в грузовике'
    ].join('|'),
    'i'
  );
  if (fuelKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Похоже, что закончилось топливо.',
      suggestedService: 'доставка топлива',
    };
  }

  // Priority 4: General technical assistance
  const assistanceKeywords = new RegExp(
    [
      'сел аккумулятор', 'разрядился аккумулятор', 'не крутит стартер', 'нужен прикурить', 'прикурить авто', 'помочь завестись', 'завести машину', 'срочный прикуривание', 'замена аккумулятора', 'купить аккумулятор', 'прокол колеса', 'спустило колесо', 'порезана шина', 'лопнула шина', 'поменять колесо', 'замена запаски', 'нет домкрата', 'застрял с проколом', 'ремонт колеса', 'вулканизация на месте', 'потеря ключей', 'ключи в машине', 'захлопнулась дверь', 'срочное вскрытие', 'вскрыть авто', 'вскрыть дверь', 'без ключей', 'помощь с замком', 'открыть автомобиль', 'заклинил замок', 'открыть багажник', 'не работает брелок', 'сломанный ключ', 'услуги автослесаря', 'выездной автослесарь', 'мелкий ремонт на месте', 'заменить предохранитель', 'перегорел предохранитель', 'нет света', 'не горят фары', 'заменить лампочку', 'порвался ремень генератора', 'заменить ремень', 'свистит ремень', 'течет охлаждайка', 'долить антифриз', 'течет масло', 'долить масло', 'заменить щетки стеклоочистителя', 'заклинило тормоз', 'закипел антифриз', 'перегрев двигателя', 'долить воду в радиатор', 'сломался трос акселератора', 'заедает педаль газа', 'порвался шланг', 'лопнул патрубок', 'течет радиатор', 'заменить патрубок', 'не работает датчик', 'ошибка двигателя', 'скинуть ошибку', 'горит check engine', 'не работает генератор', 'не заряжает аккумулятор', 'шумит подшипник', 'стук в подвеске', 'замена лампы фары', 'замена лампы стоп-сигнала', 'не работает стеклоочиститель', 'не брызгают омыватели', 'засорился омыватель', 'поменять жидкость омывателя', 'заедает стеклоподъемник', 'не работает стеклоподъемник', 'сломался дворник', 'оторвался дворник', 'не работает прикуриватель', 'не работает магнитола', 'нет зарядки в прикуривателе', 'замена прикуривателя', 'не работает печка', 'холодно в салоне', 'засорился салонный фильтр', 'заменить воздушный фильтр', 'не закрывается лючок бензобака', 'сломался замок капота', 'открыть капот', 'заклинил багажник', 'не работает кнопка багажника', 'заменить свечи', 'машина троит', 'плохой запуск', 'чихнул двигатель', 'заменить дворники'
    ].join('|'),
    'i'
  );
  if (assistanceKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Обнаружена техническая неисправность, которую можно устранить на месте.',
      suggestedService: 'техпомощь',
    };
  }

  // Default case if no keywords match
  return {
    diagnosis:
      'Не удалось автоматически определить проблему. Пожалуйста, выберите услугу вручную.',
    suggestedService: null,
  };
};

export function ServiceRequestForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { setActiveOrder } = useAppContext();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');

  const [useWithoutAI, setUseWithoutAI] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<DiagnoseProblemOutput | null>(
    null
  );
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
      serviceType:
        serviceParam && serviceTypes.some(s => s.value === serviceParam)
          ? serviceParam
          : undefined,
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

      // Simulate AI call with keywords
      const result = simulateAiDiagnosis(descriptionValue);

      // Use a promise to keep the structure similar and simulate network delay
      new Promise<DiagnoseProblemOutput | null>(resolve => {
        setTimeout(() => {
          resolve(result);
        }, 500); // 500ms delay for simulation
      })
        .then(result => {
          setAiDiagnosis(result);
          if (result?.suggestedService) {
            setValue('serviceType', result.suggestedService, {
              shouldValidate: true,
            });
          }
        })
        .finally(() => {
          setIsDiagnosing(false);
        });
    }, 1000); // 1-second debounce

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
    toast({
      title: 'Заявка отправлена!',
      description: 'Мы ищем ближайшего исполнителя.',
    });

    const service = serviceTypes.find(s => s.value === data.serviceType);

    // Simulate finding a provider and creating an order after a delay
    setTimeout(() => {
      const newOrder = {
        id: `SAHA-${Math.floor(Math.random() * 900) + 100}`,
        service: (service?.label as ServiceType) || 'Техпомощь',
        date: new Date().toISOString().split('T')[0],
        status: 'В процессе' as const,
        price: Math.floor(Math.random() * 4000) + 1500,
        provider:
          mockProviders[Math.floor(Math.random() * mockProviders.length)],
        arrivalTime: Math.floor(Math.random() * 10) + 5,
      };

      setActiveOrder(newOrder);
      toast({
        title: 'Исполнитель найден!',
        description: `${newOrder.provider?.name} скоро будет у вас.`,
      });
      router.push('/dashboard');
    }, 2000);
  }
  
  const suggestedServiceLabel = aiDiagnosis?.suggestedService
    ? serviceTypes.find(s => s.value === aiDiagnosis.suggestedService)?.label
    : '';

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
                <AlertTitle className="flex items-center gap-2">
                  {isDiagnosing
                    ? 'Анализ проблемы...'
                    : `Рекомендуемая услуга${suggestedServiceLabel ? `: ${suggestedServiceLabel}` : ''}`
                  }
                  {isDiagnosing && <Loader2 className="h-4 w-4 animate-spin" />}
                </AlertTitle>
                <AlertDescription>
                  {isDiagnosing
                    ? 'Анализируем вашу проблему, чтобы предложить наиболее подходящее решение.'
                    : aiDiagnosis?.diagnosis
                  }
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
                    <Input
                      placeholder="Например, г. Якутск, ул. Ленина, д. 1"
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
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Найти исполнителя
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
