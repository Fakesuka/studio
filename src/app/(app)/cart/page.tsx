'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ArrowLeft, Snowflake } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function CartPage() {
  const { cart, updateCartItemQuantity, removeFromCart, isContextLoading } =
    useAppContext();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cart.length > 0 ? 500 : 0;
  const total = subtotal + shipping;

  if (isContextLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Snowflake className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/marketplace"
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Назад</span>
        </Link>
        <h1 className="text-3xl font-bold">Корзина</h1>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ваши товары ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          data-ai-hint={item.imageHint}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                          })}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="h-8 w-14 rounded-md border text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-right font-semibold">
                          {(item.price * item.quantity).toLocaleString(
                            'ru-RU',
                            { style: 'currency', currency: 'RUB' }
                          )}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-muted-foreground">
                    Ваша корзина пуста.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Итог</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
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
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Link href="/checkout" passHref className="w-full">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={cart.length === 0}
                >
                  Перейти к оформлению
                </Button>
              </Link>
              <Link href="/marketplace" passHref className="w-full">
                <Button variant="outline" className="w-full">
                  Продолжить покупки
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
