'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car,
  Flame,
  Fuel,
  ImageIcon,
  Loader2,
  Sparkles,
  Truck,
  Wrench,
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
import { toast } from '@/hooks/use-toast';
import { summarizeRoadCondition } from '@/ai/flows/summarize-road-condition';
import { suggestStartingPrice } from '@/ai/flows/suggest-starting-price';

const formSchema = z.object({
  serviceType: z.string({ required_error: 'Пожалуйста, выберите тип услуги.' }),
  description: z.string().min(10, 'Пожалуйста, предоставьте больше деталей.'),
  distance: z.coerce.number().min(1, 'Расстояние должно быть не менее 1 км.'),
  timeOfDay: z.string({ required_error: 'Пожалуйста, выберите время суток.' }),
  urgency: z.string({ required_error: 'Пожалуйста, выберите срочность.' }),
  photo: z.any().optional(),
});

type ServiceRequestFormValues = z.infer<typeof formSchema>;

const serviceTypes = [
  { value: 'отогрев', label: 'Отогрев авто', icon: Flame },
  { value: 'доставка топлива', label: 'Доставка топлива', icon: Fuel },
  { value: 'техпомощь', label: 'Техпомощь', icon: Wrench },
  { value: 'эвакуатор', label: 'Эвакуатор', icon: Truck },
];

export function ServiceRequestForm() {
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceReasoning, setPriceReasoning] = useState<string | null>(null);
  const [roadSummary, setRoadSummary] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

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

  const handleSuggestPrice = async () => {
    const { serviceType, distance, timeOfDay, urgency } = form.getValues();
    if (!serviceType || !distance || !timeOfDay || !urgency) {
      toast({
        variant: 'destructive',
        title: 'Недостаточно информации',
        description:
          'Пожалуйста, заполните тип услуги, расстояние, время и срочность, чтобы предложить цену.',
      });
      return;
    }

    setIsPriceLoading(true);
    setSuggestedPrice(null);
    setPriceReasoning(null);

    try {
      const result = await suggestStartingPrice({
        serviceType,
        distance,
        timeOfDay,
        urgency,
      });
      setSuggestedPrice(result.suggestedPrice);
      setPriceReasoning(result.reasoning);
      toast({
        title: 'Цена предложена!',
        description: `Мы рекомендуем стартовую цену ${result.suggestedPrice} RUB.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось предложить цену. Пожалуйста, попробуйте еще раз.',
      });
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleSummarizeCondition = async () => {
    const photoDataUri = form.getValues('photo');
    if (!photoDataUri) {
      toast({
        variant: 'destructive',
        title: 'Нет фото',
        description: 'Пожалуйста, загрузите фото дороги, чтобы получить сводку.',
      });
      return;
    }

    setIsSummaryLoading(true);
    setRoadSummary(null);

    try {
      const result = await summarizeRoadCondition({ photoDataUri });
      setRoadSummary(result.summary);
      toast({
        title: 'Сводка сгенерирована!',
        description:
          'AI-помощник создал сводку о дорожных условиях по вашему фото.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось сгенерировать сводку. Пожалуйста, попробуйте еще раз.',
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  async function onSubmit(data: ServiceRequestFormValues) {
    toast({
      title: 'Запрос отправлен!',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Создать запрос на обслуживание</CardTitle>
        <CardDescription>
          Заполните детали ниже, чтобы найти исполнителя.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип услуги</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите услугу" />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание проблемы</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Например, машина не заводится, кажется, сел аккумулятор. Я нахожусь возле Ленских столбов."
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фото дороги/проблемы</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </FormControl>
                      {photoPreview && (
                        <div className="mt-2 relative">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="rounded-md object-cover max-h-40"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {roadSummary && (
                  <div className="rounded-lg border bg-secondary/50 p-4">
                      <p className="text-sm font-medium">AI-сводка о дороге:</p>
                      <p className="text-sm text-muted-foreground">{roadSummary}</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSummarizeCondition}
                  disabled={isSummaryLoading || !form.watch('photo')}
                  className="w-full"
                >
                  {isSummaryLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Сводка о состоянии дороги
                </Button>
              </div>

              <div className="space-y-6">
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Динамическое ценообразование
                    </CardTitle>
                    <CardDescription>
                      Позвольте AI предложить справедливую стартовую цену на основе условий.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Расстояние до вас (км)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 15"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timeOfDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Время суток</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите время" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Утро</SelectItem>
                                <SelectItem value="afternoon">
                                  День
                                </SelectItem>
                                <SelectItem value="evening">Вечер</SelectItem>
                                <SelectItem value="night">Ночь</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Срочность</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите срочность" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Низкая</SelectItem>
                                <SelectItem value="medium">Средняя</SelectItem>
                                <SelectItem value="high">Высокая</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    {suggestedPrice && (
                      <div className="w-full text-center rounded-lg border bg-background p-4">
                        <p className="text-sm text-muted-foreground">
                          Рекомендуемая стартовая цена
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {suggestedPrice.toLocaleString('ru-RU')} RUB
                        </p>
                        {priceReasoning && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {priceReasoning}
                          </p>
                        )}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleSuggestPrice}
                      disabled={isPriceLoading}
                      className="w-full"
                    >
                      {isPriceLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Предложить цену
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full">
              Отправить запрос
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
