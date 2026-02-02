'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Store,
  Snowflake,
  PackageOpen,
  Pencil,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { getCurrentUserId } from '@/lib/user-utils';

const productFormSchema = z
  .object({
    name: z.string().min(3, 'Название товара должно быть длиннее 3 символов.'),
    description: z
      .string()
      .min(10, 'Описание должно быть длиннее 10 символов.'),
    price: z.coerce.number().positive('Цена должна быть положительным числом.'),
    image: z.any().optional(),
    delivery: z.boolean().default(false),
    deliveryPrice: z.preprocess(
      val => (val === '' ? undefined : val),
      z.coerce
        .number({ invalid_type_error: 'Введите число.' })
        .nonnegative('Цена не может быть отрицательной.')
        .optional()
    ),
    pickup: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.delivery && data.deliveryPrice === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['deliveryPrice'],
        message:
          'Укажите цену доставки, если доставка доступна. Укажите 0 для бесплатной доставки.',
      });
    }
  });

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function MyStorePage() {
  const {
    shops,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateShop,
    isSeller,
    isContextLoading,
    sellerProfile,
  } = useAppContext();
  const { toast } = useToast();
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditShopOpen, setIsEditShopOpen] = useState(false);
  const [shopImagePreview, setShopImagePreview] = useState<string | null>(null);
  const [shopBannerPreview, setShopBannerPreview] = useState<string | null>(null);

  // Find user shop - first try by userId, then take first shop if user is seller
  const userId = getCurrentUserId();
  const userShop = (shops || []).find(shop => shop.userId === userId) ||
                   (isSeller && sellerProfile && (shops || []).length > 0 ? (shops || [])[0] : null);
  const sellerProducts = userShop
    ? (products || []).filter(p => p.shopId === userShop.id)
    : [];

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      delivery: false,
      pickup: true,
      deliveryPrice: undefined,
    },
  });

  const delivery = productForm.watch('delivery');

  const shopFormSchema = z.object({
    name: z.string().min(3, 'Название магазина должно быть длиннее 3 символов.'),
    description: z
      .string()
      .min(10, 'Описание должно быть длиннее 10 символов.'),
    type: z.enum(['store', 'person']),
    address: z.string().optional(),
    imageUrl: z.string().optional().or(z.literal('')),
    bannerUrl: z.string().optional().or(z.literal('')),
  });

  type ShopFormValues = z.infer<typeof shopFormSchema>;

  const shopForm = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: userShop?.name || '',
      description: userShop?.description || '',
      type: userShop?.type || 'store',
      address: userShop?.address || '',
      imageUrl: userShop?.imageUrl || '',
      bannerUrl: userShop?.bannerUrl || '',
    },
  });

  if (isContextLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Snowflake className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSeller || !userShop) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Вы не продавец</h2>
        <p className="max-w-md text-muted-foreground">
          Чтобы управлять магазином, вам необходимо сначала зарегистрироваться в
          качестве продавца на странице вашего профиля.
        </p>
        <Link href="/profile">
          <Button>Перейти в профиль</Button>
        </Link>
      </div>
    );
  }

  const handleShopEditOpen = (open: boolean) => {
    setIsEditShopOpen(open);
    if (open && userShop) {
      shopForm.reset({
        name: userShop.name,
        description: userShop.description,
        type: userShop.type,
        address: userShop.address || '',
        imageUrl: userShop.imageUrl || '',
        bannerUrl: userShop.bannerUrl || '',
      });
      setShopImagePreview(userShop.imageUrl || null);
      setShopBannerPreview(userShop.bannerUrl || null);
    }
  };

  const handleShopSubmit = async (data: ShopFormValues) => {
    if (!userShop) return;
    const payload = {
      ...data,
      address: data.type === 'store' ? data.address : '',
      imageUrl: data.imageUrl || userShop.imageUrl,
      bannerUrl: data.bannerUrl || userShop.bannerUrl,
    };
    try {
      await updateShop(userShop.id, payload);
      toast({
        title: 'Магазин обновлен',
        description: 'Данные магазина успешно сохранены.',
      });
      setIsEditShopOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить магазин.',
        variant: 'destructive',
      });
    }
  };

  const onProductSubmit = async (data: ProductFormValues) => {
    const { image, ...productData } = data;
    const finalProductData = { ...productData };

    if (!finalProductData.delivery) {
      delete finalProductData.deliveryPrice;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...finalProductData,
          imageUrl: photoPreview || editingProduct.imageUrl,
          imageHint: `photo of ${data.name}`,
        });
        toast({
          title: 'Товар обновлен!',
          description: `${data.name} был успешно обновлен.`,
        });
      } else {
        await addProduct({
          ...finalProductData,
          // TODO: Replace with real photo upload functionality
          // Currently using placeholder image service
          imageUrl:
            photoPreview || `https://picsum.photos/seed/${data.name}/600/400`,
          imageHint: `photo of ${data.name}`,
        });
        toast({
          title: 'Товар добавлен!',
          description: `${data.name} теперь в вашем магазине.`,
        });
      }

      setIsAddProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      setPhotoPreview(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить товар.',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      delivery: product.delivery,
      deliveryPrice: product.deliveryPrice,
      pickup: product.pickup,
    });
    setPhotoPreview(product.imageUrl);
    setIsAddProductDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: 'Товар удален',
        description: 'Товар был успешно удален из вашего магазина.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар.',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddProductDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      productForm.reset();
      setPhotoPreview(null);
    }
  };

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
      productForm.setValue('image', dataUri);
    }
  };

  const handleShopImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setShopImagePreview(dataUri);
      shopForm.setValue('imageUrl', dataUri);
    }
  };

  const handleShopBannerChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setShopBannerPreview(dataUri);
      shopForm.setValue('bannerUrl', dataUri);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Назад в профиль</span>
          </Link>
          <h1 className="text-3xl font-bold">Мой магазин</h1>
        </div>
        <div className="flex flex-wrap gap-2 pl-9">
          <Dialog open={isEditShopOpen} onOpenChange={handleShopEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Редактировать магазин
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-full max-h-[95vh] w-full flex-col sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Данные магазина</DialogTitle>
                <DialogDescription>
                  Обновите название, описание и формат продавца.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto py-4">
                <Form {...shopForm}>
                  <form
                    id="edit-shop-form"
                    onSubmit={shopForm.handleSubmit(handleShopSubmit)}
                    className="space-y-4 px-1"
                  >
                    <FormField
                      control={shopForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input placeholder="Название магазина" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shopForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Описание магазина" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shopForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Формат</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите формат" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="store">Магазин</SelectItem>
                              <SelectItem value="person">Частное лицо</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shopForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес</FormLabel>
                          <FormControl>
                            <Input placeholder="Адрес магазина" {...field} />
                          </FormControl>
                          <FormDescription>
                            Доступно для магазинов с доставкой/самовывозом.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shopForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Изображение</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleShopImageChange}
                            />
                          </FormControl>
                          {shopImagePreview && (
                            <div className="mt-2">
                              <Image
                                src={shopImagePreview}
                                alt="Предпросмотр изображения магазина"
                                width={220}
                                height={140}
                                className="max-h-40 w-auto rounded-md object-cover"
                              />
                            </div>
                          )}
                          <Input type="hidden" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shopForm.control}
                      name="bannerUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Баннер</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleShopBannerChange}
                            />
                          </FormControl>
                          {shopBannerPreview && (
                            <div className="mt-2">
                              <Image
                                src={shopBannerPreview}
                                alt="Предпросмотр баннера"
                                width={260}
                                height={120}
                                className="max-h-40 w-auto rounded-md object-cover"
                              />
                            </div>
                          )}
                          <Input type="hidden" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Отмена
                  </Button>
                </DialogClose>
                <Button type="submit" form="edit-shop-form">
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isAddProductDialogOpen}
            onOpenChange={handleDialogClose}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-full max-h-[95vh] w-full flex-col sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? 'Измените информацию о товаре.'
                    : 'Заполните информацию о товаре, чтобы добавить его в магазин.'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto py-4">
                <Form {...productForm}>
                  <form
                    id="add-product-form"
                    onSubmit={productForm.handleSubmit(onProductSubmit)}
                    className="space-y-4 px-1"
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
                              <Image
                                src={photoPreview}
                                alt="Предпросмотр"
                                width={160}
                                height={90}
                                className="max-h-40 w-auto rounded-md"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <FormLabel>Условия получения</FormLabel>
                      <FormField
                        control={productForm.control}
                        name="delivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Доставка</FormLabel>
                              <FormDescription>
                                Вы осуществляете доставку этого товара.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      {delivery && (
                        <FormField
                          control={productForm.control}
                          name="deliveryPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Цена доставки (в рублях)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="300"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                               <FormDescription>
                                Укажите 0 для бесплатной доставки.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={productForm.control}
                        name="pickup"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Самовывоз (бесплатно)</FormLabel>
                              <FormDescription>
                                Покупатель может забрать товар сам.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Отмена
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form="add-product-form"
                  disabled={productForm.formState.isSubmitting}
                >
                  {editingProduct ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{userShop.name}</CardTitle>
          <CardDescription>
            {userShop.description}
            <span className="mt-2 block text-sm text-muted-foreground">
              Формат: {userShop.type === 'store' ? 'Магазин' : 'Частное лицо'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="mb-4 text-lg font-semibold">Ваши товары</h4>
          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sellerProducts.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={product.imageHint}
                      />
                    </div>
                    <h5 className="mt-4 font-semibold">{product.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {product.price.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      })}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Изменить
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие невозможно отменить. Товар будет
                            навсегда удален из вашего магазина.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                У вас пока нет товаров.
              </p>
              <p className="text-sm text-muted-foreground">
                Нажмите "Добавить товар", чтобы начать.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
