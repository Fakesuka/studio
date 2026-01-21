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

  // More specific/critical issues first (Эвакуатор)
  const evacuatorKeywords =
    /\b(дтп|авари|удар|увезти|эвакуа|яму|подвеск|амортизатор|утонул|гидроудар|вода в двигател|отвалилось колесо|сорвало баллон|застрял|ремень грм|стук в двигател|задымился|дым из-под капота|тормоз|провалилась педаль|акпп|не переключаются передачи|слетел с цепи|повреждения после дтп|помято крыло|рулевой рейки|стук в руле)\b/;
  if (evacuatorKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Имитация AI: Обнаружена серьезная проблема. Вероятно, потребуется эвакуатор.',
      suggestedService: 'эвакуатор',
    };
  }

  // Cold-related issues (Отогрев)
  const heatingKeywords =
    /\b(холод|замерз|примерзли замки|не открывается дверь|примерз стеклоомыватель|не работает печка|холодно в салоне|отогрев)\b/;
  if (heatingKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Имитация AI: Обнаружены ключевые слова, связанные с холодом. Вероятно, требуется отогрев автомобиля.',
      suggestedService: 'отогрев',
    };
  }

  // Fuel issues (Доставка топлива)
  const fuelKeywords =
    /\b(топлив|бензин|солярк|заглох|пустой бак|кончился бензин)\b/;
  if (fuelKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Имитация AI: Проблема, вероятно, связана с нехваткой топлива.',
      suggestedService: 'доставка топлива',
    };
  }

  // General tech assistance (Техпомощь)
  const assistanceKeywords =
    /\b(аккумулятор|акб|сел|разрядился|не крутит стартер|прикуриван|колес[ао]|прокол|спустило|порезана шина|вулканизаци|заглох|не заводится|троит двигатель|ключ[ией]|захлопнулась дверь|вскрытие|перегрев|закипел|зажигание|щелкает|крутит|сломалась|не едет|генератор|лампа акб|ремень генератора|свист|течет масло|течет антифриз|пятно под машин|фильтр|дергается|стартер|check engine|электроник|привод|треск|патрубк|шланг|турбин|дым|свечи|сигнализац|гур|тяжелый руль)\b/;
  if (assistanceKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Имитация AI: Похоже, у вас техническая неисправность. Рекомендуется техпомощь.',
      suggestedService: 'техпомощь',
    };
  }

  return {
    diagnosis:
      'Имитация AI: Не удалось автоматически определить проблему. Пожалуйста, выберите услугу вручную или опишите проблему подробнее.',
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
                    : 'Результат анализа'}
                  {isDiagnosing && <Loader2 className="h-4 w-4 animate-spin" />}
                </AlertTitle>
                <AlertDescription>
                  {aiDiagnosis?.diagnosis ||
                    'Анализируем вашу проблему, чтобы предложить наиболее подходящее решение.'}
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
                    disabled={!useWithoutAI && (isDiagnosing || (!!aiDiagnosis && !!aiDiagnosis.suggestedService))}
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
