'use client';

import Image from 'next/image';
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
import { ShoppingCart } from 'lucide-react';

export default function MarketplacePage() {
  const { toast } = useToast();

  const handleAddToCart = (productName: string) => {
    toast({
      title: 'Добавлено в корзину',
      description: `${productName} был добавлен в вашу корзину.`,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Маркетплейс</h1>
        <p className="text-muted-foreground">
          Товары первой необходимости для водителей.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockProducts.map(product => (
          <Card key={product.id}>
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-md">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  data-ai-hint={product.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="mb-1 text-lg">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <p className="text-lg font-semibold">
                {product.price.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}
              </p>
              <Button onClick={() => handleAddToCart(product.name)}>
                <ShoppingCart className="mr-2 h-4 w-4" />В корзину
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
