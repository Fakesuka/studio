'use client';

import Image from 'next/image';
import Link from 'next/link';
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Package,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function MarketplacePage() {
  const { toast } = useToast();
  const {
    products,
    shops,
    addToCart,
    updateCartItemQuantity,
    getCartItemQuantity,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ delivery: boolean; pickup: boolean }>(
    {
      delivery: false,
      pickup: false,
    }
  );

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

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => {
      if (filters.delivery && !product.delivery) return false;
      if (filters.pickup && !product.pickup) return false;
      return true;
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Маркетплейс</h1>
          <p className="text-muted-foreground">
            Товары первой необходимости для водителей.
          </p>
        </div>
        <Link href="/profile" passHref>
          <Button variant="outline">Стать продавцом</Button>
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Фильтры:
          </span>
          <Button
            variant={filters.delivery ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilters(prev => ({ ...prev, delivery: !prev.delivery }))
            }
          >
            <Truck className="mr-2 h-4 w-4" />
            Доставка
          </Button>
          <Button
            variant={filters.pickup ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilters(prev => ({ ...prev, pickup: !prev.pickup }))
            }
          >
            <Package className="mr-2 h-4 w-4" />
            Самовывоз
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Магазины</h2>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {shops.map(shop => (
              <CarouselItem
                key={shop.id}
                className="basis-1/3 pl-4 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
              >
                <Link
                  href={`/marketplace/shops/${shop.id}`}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border transition-colors group-hover:border-primary">
                    <Image
                      src={shop.imageUrl}
                      alt={shop.name}
                      fill
                      className="object-cover"
                      data-ai-hint={shop.imageHint}
                    />
                  </div>
                  <p className="w-full truncate text-sm font-medium">
                    {shop.name}
                  </p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12 hidden sm:flex" />
          <CarouselNext className="mr-12 hidden sm:flex" />
        </Carousel>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Товары</h2>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
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
              <CardFooter className="flex items-center justify-between p-4 pt-0">
                <p className="text-lg font-semibold">
                  {product.price.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </p>
                {quantityInCart(product.id) === 0 ? (
                  <Button
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />В корзину
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
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
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center">
          <p className="text-muted-foreground">
            Товары по вашему запросу не найдены.
            <br />
            Попробуйте изменить поиск или фильтры.
          </p>
        </div>
      )}
    </div>
  );
}
