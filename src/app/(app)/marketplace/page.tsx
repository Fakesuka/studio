'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FrostButton } from '@/components/ui/frost-button';
import { IceCard } from '@/components/ui/ice-card';
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
  Store,
  Snowflake,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function MarketplacePage() {
  const { toast } = useToast();
  const {
    products,
    shops,
    cart,
    addToCart,
    updateCartItemQuantity,
    getCartItemQuantity,
    isSeller,
    marketplaceOrders,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ delivery: boolean; pickup: boolean }>(
    {
      delivery: false,
      pickup: false,
    }
  );
  const formatOrderDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return format(date, 'd MMM yyyy, HH:mm', { locale: ru });
  };

  const marketplaceStatusLabels: Record<string, string> = {
    Новый: 'Новый',
    'В обработке': 'Подтвержден',
    Доставляется: 'Доставляется',
    Завершен: 'Доставлен',
    Отменен: 'Отменен',
  };

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId);
    toast({
      title: `${productName} добавлен в корзину`,
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
    <div className="relative pb-24">
      {/* Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            Маркет
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isSeller ? (
            <Link href="/my-store" passHref>
              <FrostButton variant="primary" className="shadow-neon-cyan/20">
                <Store className="mr-2 h-4 w-4" />
                Управление
              </FrostButton>
            </Link>
          ) : (
            <Link href="/profile" passHref>
              <FrostButton variant="ghost" className="text-cyan-200">Стать продавцом</FrostButton>
            </Link>
          )}
          <Link href="/cart" passHref>
            <FrostButton variant="default" size="icon" className="relative rounded-full bg-white/10 hover:bg-white/20">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-cyan text-xs font-bold text-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </FrostButton>
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-1">
        <div className="relative w-full sm:max-w-xs group">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 rounded-xl focus:border-neon-cyan/50 focus:ring-neon-cyan/20 backdrop-blur-md transition-all pl-10 h-11"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <Snowflake className="h-5 w-5 text-neon-cyan/50" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <FrostButton
            variant={filters.delivery ? 'primary' : 'default'}
            size="sm"
            onClick={() =>
              setFilters(prev => ({ ...prev, delivery: !prev.delivery }))
            }
          >
            <Truck className="mr-2 h-4 w-4" />
            Доставка
          </FrostButton>
          <FrostButton
            variant={filters.pickup ? 'primary' : 'default'}
            size="sm"
            onClick={() =>
              setFilters(prev => ({ ...prev, pickup: !prev.pickup }))
            }
          >
            <Package className="mr-2 h-4 w-4" />
            Самовывоз
          </FrostButton>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-neon-purple rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          Мои покупки
        </h2>
        {marketplaceOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {marketplaceOrders.map((order, index) => (
              <IceCard key={order.id} variant="crystal" className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-200/70">
                      Заказ №{index + 1}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatOrderDate(order.date)}
                    </p>
                    <p className="mt-3 text-sm text-white">
                      {order.items.length} товар(а) · {order.total.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neon-purple">
                    {marketplaceStatusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </IceCard>
            ))}
          </div>
        ) : (
          <IceCard variant="crystal" className="p-6 text-center text-sm text-gray-400">
            У вас пока нет покупок.
          </IceCard>
        )}
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          Магазины
        </h2>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {(shops || []).map(shop => (
              <CarouselItem
                key={shop.id}
                className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
              >
                <Link
                  href={`/marketplace/shops/${shop.id}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:border-neon-cyan group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:scale-105">
                    <Image
                      src={shop.imageUrl}
                      alt={shop.name}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="w-full truncate text-sm font-medium text-blue-100 group-hover:text-neon-cyan transition-colors">
                    {shop.name}
                  </p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-neon-orange rounded-full shadow-[0_0_10px_rgba(255,100,0,0.8)]" />
        Товары
      </h2>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            return (
              <IceCard
                key={product.id}
                variant="crystal"
                className="flex flex-col h-full group"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-black/20">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                <div className="flex-1 p-4 flex flex-col gap-2">
                  <div>
                    <h3 className="line-clamp-1 text-base font-semibold text-white group-hover:text-neon-cyan transition-colors">{product.name}</h3>
                    <p className="line-clamp-2 text-xs text-gray-400 h-8 overflow-hidden">{product.description}</p>
                  </div>

                  <div className="mt-auto pt-2 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold font-mono text-neon-cyan">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                      {product.delivery && <Truck className="h-3 w-3 text-gray-500" />}
                    </div>

                    {quantityInCart(product.id) === 0 ? (
                      <FrostButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="w-full text-xs h-9"
                      >
                        <ShoppingCart className="mr-2 h-3 w-3" /> В корзину
                      </FrostButton>
                    ) : (
                      <div className="flex items-center justify-between bg-black/20 rounded-lg p-1 border border-white/10">
                        <FrostButton
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDecreaseQuantity(product.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </FrostButton>
                        <span className="text-sm font-bold text-white w-6 text-center">
                          {quantityInCart(product.id)}
                        </span>
                        <FrostButton
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleIncreaseQuantity(product.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </FrostButton>
                      </div>
                    )}
                  </div>
                </div>
              </IceCard>
            );
          })}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center flex-col gap-4">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
            <Snowflake className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-500">
            Товары не найдены.<br />Попробуйте позже.
          </p>
        </div>
      )}
    </div>
  );
}
