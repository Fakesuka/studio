'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const checkoutFormSchema = z.object({
  name: z.string().min(2, 'Имя обязательно.'),
  phone: z.string().min(5, 'Телефон обязателен.'),
  address: z.string().min(10, 'Адрес доставки обязателен.'),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { cart, placeMarketplaceOrder, isContextLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [userCity, setUserCity] = useState('Якутск');

  useEffect(() => {
    // Load user's city from profile
    api.getProfile().then((profile: any) => {
      if (profile.city) {
        setUserCity(profile.city);
      }
    }).catch(console.error);
  }, []);

  const subtotal = cart.reduce((sum, item) => {
    const normalizedItem = item as typeof item & { product?: typeof item };
    const product = normalizedItem.product ?? item;
    const price = Number(product?.price ?? 0);
    return sum + price * item.quantity;
    return sum + product.price * item.quantity;
  }, 0);
  const shipping = cart.length > 0 ? 500 : 0; // Assuming a fixed shipping cost for simplicity
  const total = subtotal + shipping;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  function onSubmit(data: CheckoutFormValues) {
    if (!placeMarketplaceOrder) return;
    placeMarketplaceOrder({
      customer: data,
      items: cart,
      total,
    });

    toast({
      title: 'Заказ оформлен!',
      description: 'Спасибо за покупку. Мы свяжемся с вами для подтверждения.',
    });
    router.push('/orders');
  }

  if (isContextLoading) {
    return <div>Загрузка...</div>;
  }

  if (cart.length === 0 && !isContextLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-6 text-2xl font-bold">Ваша корзина пуста</h2>
        <p className="mt-2 text-muted-foreground">
          Похоже, вы еще ничего не добавили.
        </p>
        <Link href="/marketplace" className="mt-6">
          <Button>Вернуться в маркетплейс</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/cart"
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Назад в корзину</span>
        </Link>
        <h1 className="text-3xl font-bold">Оформление заказа</h1>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Адрес доставки</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  id="checkout-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Контактное лицо (ФИО)</FormLabel>
                        <FormControl>
                          <Input placeholder="Иван Петров" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер телефона</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+7 (999) 123-45-67"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес доставки</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`г. ${userCity}, ул. Ленина, д. 1, кв. 1`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {cart.map(item => {
                const normalizedItem = item as typeof item & { product?: typeof item };
                const product = normalizedItem.product ?? item;
                const productId = normalizedItem.product?.id ?? item.id;
                const imageSrc = product?.imageUrl || '/logo.svg';
                const price = Number(product?.price ?? 0);
                return (
                <div key={productId} className="flex items-start gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={imageSrc}
                      alt={product?.name || 'Товар'}
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      data-ai-hint={product.imageHint}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium leading-tight">
                      {product?.name || 'Товар'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(price * item.quantity).toLocaleString('ru-RU')} ₽
                    <p className="font-medium leading-tight">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(product.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              );
              })}
              <Separator />
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span>Промежуточный итог</span>
                  <span>
                    {subtotal.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>
                    {shipping.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Всего</span>
                  <span>
                    {total.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                Оформить заказ
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
