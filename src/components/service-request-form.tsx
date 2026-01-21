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

const formSchema = z.object({
  serviceType: z.string({ required_error: 'Пожалуйста, выберите тип услуги.' }),
  location: z.string().min(5, 'Пожалуйста, укажите ваше местоположение.'),
  description: z.string().min(10, 'Пожалуйста, предоставьте больше деталей.'),
  photo: z.any().optional(),
  suggestedPrice: z.coerce
    .number()
    .positive('Цена должна быть положительным числом.'),
});

type ServiceRequestFormValues = z.infer<typeof formSchema>;

const serviceTypes = [
  { value: 'Отогрев авто', label: 'Отогрев авто', icon: Flame },
  { value: 'Доставка топлива', label: 'Доставка топлива', icon: Fuel },
  { value: 'Техпомощь', label: 'Техпомощь', icon: Wrench },
  { value: 'Эвакуатор', label: 'Эвакуатор', icon: Truck },
];

const serviceTypeValues = [
  'Отогрев авто',
  'Доставка топлива',
  'Техпомощь',
  'Эвакуатор',
] as const;

// Local type for AI diagnosis simulation
type DiagnoseProblemOutput = {
  diagnosis: string;
  suggestedService: (typeof serviceTypeValues)[number] | null;
};

// Keyword-based AI simulation
const simulateAiDiagnosis = (description: string): DiagnoseProblemOutput => {
  const lowerCaseDescription = description.toLowerCase();
  const evacuatorKeywords = new RegExp(
    [
      'дверь заблокирована',
      'колесо отвалилось',
      'авария',
      'дтп',
      'не заводится',
      'сломалась',
      'увезти',
      'забрать',
      'эвакуатор',
    ].join('|'),
    'i'
  );
  if (evacuatorKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Обнаружена серьезная неисправность, рекомендуем эвакуатор.',
      suggestedService: 'Эвакуатор',
    };
  }
  const heatingKeywords = new RegExp(
    ['замерзла', 'замерз', 'отогреть', 'отогрев', 'холод', 'мороз'].join(
      '|'
    ),
    'i'
  );
  if (heatingKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Симптомы указывают на проблему, связанную с низкой температурой.',
      suggestedService: 'Отогрев авто',
    };
  }
  const fuelKeywords = new RegExp(
    ['бензин', 'топливо', 'кончилось', 'закончилось', 'пустой бак', 'заглох'].join(
      '|'
    ),
    'i'
  );
  if (fuelKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis: 'Похоже, что закончилось топливо.',
      suggestedService: 'Доставка топлива',
    };
  }
  const assistanceKeywords = new RegExp(
    [
      'колесо',
      'прокол',
      'поменять',
      'спустило',
      'аккумулятор',
      'прикурить',
      'сел акб',
    ].join('|'),
    'i'
  );
  if (assistanceKeywords.test(lowerCaseDescription)) {
    return {
      diagnosis:
        'Обнаружена техническая неисправность, которую можно устранить на месте.',
      suggestedService: 'Техпомощь',
    };
  }
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
  const { createServiceRequest } = useAppContext();
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

      const result = simulateAiDiagnosis(descriptionValue);

      new Promise<DiagnoseProblemOutput | null>(resolve => {
        setTimeout(() => {
          resolve(result);
        }, 500);
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
                    : `Рекомендуемая услуга${
                        suggestedServiceLabel ? `: ${suggestedServiceLabel}` : ''
                      }`}
                  {isDiagnosing && <Loader2 className="h-4 w-4 animate-spin" />}
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
                    <Input
                      placeholder="Например, г. Якутск, ул. Ленина, д. 1"
                      {...field}
                    />
                  </FormControl>
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
    </Card>
  );
}
