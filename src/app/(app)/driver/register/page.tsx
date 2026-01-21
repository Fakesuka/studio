'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { UserCog } from 'lucide-react';
import type { ServiceType, LegalStatus } from '@/lib/types';
import { serviceTypesList } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const driverFormSchema = z.object({
  name: z.string().min(3, 'Имя должно быть длиннее 3 символов.'),
  vehicle: z.string().min(5, 'Укажите модель и марку автомобиля.'),
  services: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Вы должны выбрать хотя бы одну услугу.',
  }),
  legalStatus: z.enum(['Самозанятый', 'ИП'], {
    required_error: 'Пожалуйста, выберите ваш юридический статус.',
  }),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function DriverRegisterPage() {
  const { registerAsDriver } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: '',
      vehicle: '',
      services: [],
    },
  });

  function onSubmit(data: DriverFormValues) {
    registerAsDriver({
      ...data,
      services: data.services as ServiceType[],
      legalStatus: data.legalStatus as LegalStatus,
    });
    toast({
      title: 'Вы стали водителем!',
      description: 'Теперь вы можете принимать заказы.',
    });
    router.push('/driver/dashboard');
  }

  return (
    <div className="flex w-full justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Регистрация водителя
          </CardTitle>
          <CardDescription>
            Заполните форму, чтобы начать принимать заказы.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                    <FormDescription>
                      Укажите марку, модель и гос. номер.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
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
                        control={form.control}
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
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                Стать водителем
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
