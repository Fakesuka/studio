'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  MapPin,
  Clock,
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
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const { toast } = useToast();
  const {
    shops,
    products,
    addToCart,
    updateCartItemQuantity,
    getCartItemQuantity,
  } = useAppContext();

  const shop = (shops || []).find(s => s.id === shopId);
  const shopProducts = (products || []).filter(p => p.shopId === shopId);

  if (!shop) {
    notFound();
  }

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId);
    toast({
      title: `${productName} в корзине`,
      duration: 2000,
    });
  };

  const handleDecreaseQuantity = (productId: string) => {
    const currentQuantity = getCartItemQuantity(productId);
    updateCartItemQuantity(productId, currentQuantity - 1);
  };

  const handleIncreaseQuantity = (productId: string) => {
    const currentQuantity = getCartItemQuantity(productId);
    updateCartItemQuantity(productId, currentQuantity + 1);
  };

  const quantityInCart = (productId: string) => getCartItemQuantity(productId);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/marketplace"
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Назад</span>
        </Link>
        <h1 className="truncate text-3xl font-bold">{shop.name}</h1>
      </div>

      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={shop.bannerUrl}
          alt={`Баннер магазина ${shop.name}`}
          fill
          className="object-cover"
          data-ai-hint={shop.bannerHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
        <div className="absolute bottom-0 left-0 p-6">
          <h2 className="text-4xl font-bold text-primary-foreground">
            {shop.name}
          </h2>
          <p className="mt-1 max-w-2xl text-lg text-primary-foreground/90">
            {shop.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary-foreground">
            {shop.type === 'store' && shop.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{shop.address}</span>
              </div>
            )}
            {shop.type === 'store' && shop.workingHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{shop.workingHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-2xl font-bold">Товары магазина</h3>

      {shopProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shopProducts.map(product => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-md">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    data-ai-hint={product.imageHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <CardTitle className="mb-1 line-clamp-1 text-lg">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">{product.description}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.delivery && (
                    <Badge variant="secondary">
                      Доставка
                      {product.deliveryPrice !== undefined
                        ? ` (${
                            product.deliveryPrice > 0
                              ? `${product.deliveryPrice} ₽`
                              : 'бесплатно'
                          })`
                        : ''}
                    </Badge>
                  )}
                  {product.pickup && (
                    <Badge variant="secondary">Самовывоз</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 p-4 pt-0">
                <p className="text-lg font-semibold">
                  {product.price.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </p>
                {quantityInCart(product.id) === 0 ? (
                  <Button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    className="w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />В корзину
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleDecreaseQuantity(product.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-lg font-bold">
                      {quantityInCart(product.id)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleIncreaseQuantity(product.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50">
          <p className="text-muted-foreground">
            В этом магазине пока нет товаров.
          </p>
        </div>
      )}
    </div>
  );
}
