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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Store, CheckCircle, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';

const sellerFormSchema = z.object({
  storeName: z
    .string()
    .min(3, 'Название магазина должно быть длиннее 3 символов.'),
  storeDescription: z
    .string()
    .min(10, 'Описание должно быть длиннее 10 символов.'),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

const productFormSchema = z.object({
  name: z.string().min(3, 'Название товара должно быть длиннее 3 символов.'),
  description: z.string().min(10, 'Описание должно быть длиннее 10 символов.'),
  price: z.coerce.number().positive('Цена должна быть положительным числом.'),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProfilePage() {
  const MOCK_USER_ID = 'self'; // In a real app, this would come from auth.
  const { isSeller, registerAsSeller, products, addProduct, shops } =
    useAppContext();
  const { toast } = useToast();
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const userShop = shops.find(shop => shop.userId === MOCK_USER_ID);
  const sellerProducts = userShop
    ? products.filter(p => p.shopId === userShop.id)
    : [];

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      storeName: '',
      storeDescription: '',
    },
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
    },
  });

  const onSellerSubmit = (data: SellerFormValues) => {
    registerAsSeller(data);
    toast({
      title: 'Поздравляем!',
      description: 'Вы успешно зарегистрированы как продавец.',
    });
  };

  const onProductSubmit = (data: ProductFormValues) => {
    if (!userShop) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Ваш магазин не найден.',
      });
      return;
    }
    addProduct({
      ...data,
      shopId: userShop.id,
      imageUrl:
        photoPreview || `https://picsum.photos/seed/${data.name}/600/400`,
      imageHint: `photo of ${data.name}`,
    });
    toast({
      title: 'Товар добавлен!',
      description: `${data.name} теперь в вашем магазине.`,
    });
    setIsAddProductDialogOpen(false);
    productForm.reset();
    setPhotoPreview(null);
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        productForm.setValue('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // MOCK DATA since TWA SDK is removed
  const name = 'Иван Петров';
  const username = '@ivan_petrov';

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
              <Input id="name" defaultValue={name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" defaultValue={username} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Сохранить изменения</Button>
        </CardFooter>
      </Card>

      {isSeller && userShop ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-6 w-6" />
                Ваш магазин: {userShop.name}
              </div>
              <Dialog
                open={isAddProductDialogOpen}
                onOpenChange={setIsAddProductDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Новый товар</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о товаре, чтобы добавить его в
                      магазин.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form
                      onSubmit={productForm.handleSubmit(onProductSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название товара</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Например, 'Зимние шины'"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Опишите товар..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Цена (в рублях)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="5000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="image"
                        render={() => (
                          <FormItem>
                            <FormLabel>Фотография</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                              />
                            </FormControl>
                            {photoPreview && (
                              <div className="mt-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photoPreview}
                                  alt="Предпросмотр"
                                  className="max-h-40 rounded-md"
                                />
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Отмена
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={productForm.formState.isSubmitting}
                        >
                          Добавить
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>{userShop.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-green-500 bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Статус продавца: Активен</p>
            </div>
            <h4 className="font-semibold">Ваши товары</h4>
            {sellerProducts.length > 0 ? (
              <div className="space-y-4">
                {sellerProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-md border p-2"
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                      data-ai-hint={product.imageHint}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.price.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      Управлять
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                У вас пока нет товаров. Нажмите "Добавить товар", чтобы начать.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Стать продавцом
            </CardTitle>
            <CardDescription>
              Заполните форму, чтобы начать продавать свои товары на нашей
              площадке.
            </CardDescription>
          </CardHeader>
          <Form {...sellerForm}>
            <form onSubmit={sellerForm.handleSubmit(onSellerSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={sellerForm.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название магазина</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Например, 'Автозапчасти от Ивана'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sellerForm.control}
                  name="storeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Краткое описание магазина</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите, какие товары вы продаете..."
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
                  className="w-full"
                  disabled={sellerForm.formState.isSubmitting}
                >
                  Зарегистрировать магазин
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
