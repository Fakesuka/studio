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
import { mockProducts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function MarketplacePage() {
  const { toast } = useToast();
  const { addToCart, updateCartItemQuantity, getCartItemQuantity } =
    useAppContext();

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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {mockProducts.map(product => (
          <Card key={product.id} className="flex flex-col">
            <div className="flex flex-1 flex-col">
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
                <CardTitle className="mb-1 text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardContent>
            </div>
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
    </div>
  );
}
