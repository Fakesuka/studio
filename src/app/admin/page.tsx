'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Users, Car, Store, Package, CheckCircle, Gift, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [promocodes, setPromocodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPromoDialog, setShowNewPromoDialog] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'discount_percent',
    value: 10,
    maxUses: 100,
    expiresAt: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, driversData, sellersData, productsData, usersData, promocodesData] = await Promise.all([
        fetch('/api/admin/dashboard/stats', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/drivers/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/sellers/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/products/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/users?limit=100', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/bonuses/promocodes', { headers: getHeaders() }).then(r => r.json()).catch(() => ({ promocodes: [] })),
      ]);
      setStats(statsData);
      setPendingDrivers(driversData);
      setPendingSellers(sellersData);
      setPendingProducts(productsData);
      setAllUsers(usersData);
      setPromocodes(promocodesData.promocodes || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPromocode = async () => {
    try {
      await fetch('/api/bonuses/promocodes', {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromo.code.toUpperCase(),
          type: newPromo.type,
          value: newPromo.value,
          maxUses: newPromo.maxUses || null,
          expiresAt: newPromo.expiresAt || null,
        }),
      });
      toast({
        title: 'Промокод создан!',
        description: `Код ${newPromo.code.toUpperCase()} успешно создан.`,
      });
      setShowNewPromoDialog(false);
      setNewPromo({ code: '', type: 'discount_percent', value: 10, maxUses: 100, expiresAt: '' });
      loadData();
    } catch (error) {
      console.error('Error creating promocode:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать промокод',
        variant: 'destructive',
      });
    }
  };

  const getHeaders = () => {
    const initData = (window as any).Telegram?.WebApp?.initData;
    return initData ? { 'X-Telegram-Init-Data': initData } : {};
  };

  const verifyDriver = async (id: string) => {
    try {
      await fetch(`/api/admin/drivers/${id}/verify`, { 
        method: 'POST', 
        headers: getHeaders() 
      });
      loadData();
    } catch (error) {
      console.error('Error verifying driver:', error);
    }
  };

  const verifySeller = async (id: string) => {
    try {
      await fetch(`/api/admin/sellers/${id}/verify`, { 
        method: 'POST', 
        headers: getHeaders() 
      });
      loadData();
    } catch (error) {
      console.error('Error verifying seller:', error);
    }
  };

  const approveProduct = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}/approve`, { 
        method: 'POST', 
        headers: getHeaders() 
      });
      loadData();
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Админ-панель YakGo</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Водители</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">
              На проверке: {stats?.pendingDrivers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Продавцы</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
            <p className="text-xs text-muted-foreground">
              На проверке: {stats?.pendingSellers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Товары</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              На проверке: {stats?.pendingProducts || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drivers" className="w-full">
        <TabsList>
          <TabsTrigger value="drivers">
            Водители {pendingDrivers.length > 0 && `(${pendingDrivers.length})`}
          </TabsTrigger>
          <TabsTrigger value="sellers">
            Продавцы {pendingSellers.length > 0 && `(${pendingSellers.length})`}
          </TabsTrigger>
          <TabsTrigger value="products">
            Товары {pendingProducts.length > 0 && `(${pendingProducts.length})`}
          </TabsTrigger>
          <TabsTrigger value="users">Все пользователи</TabsTrigger>
          <TabsTrigger value="promocodes">
            <Gift className="mr-2 h-4 w-4" />
            Промокоды
          </TabsTrigger>
        </TabsList>

        {/* Pending Drivers */}
        <TabsContent value="drivers" className="space-y-4">
          {pendingDrivers.length === 0 ? (
            <Card><CardContent className="p-6">Нет водителей на проверке</CardContent></Card>
          ) : (
            pendingDrivers.map((driver: any) => (
              <Card key={driver.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-bold">{driver.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Телефон: {driver.user.phone || 'не указан'}
                      </p>
                      <p className="text-sm">Автомобиль: {driver.vehicle}</p>
                      <p className="text-sm">Услуги: {driver.services.join(', ')}</p>
                      <p className="text-sm">Статус: {driver.legalStatus}</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => verifyDriver(driver.id)} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Одобрить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Sellers */}
        <TabsContent value="sellers" className="space-y-4">
          {pendingSellers.length === 0 ? (
            <Card><CardContent className="p-6">Нет продавцов на проверке</CardContent></Card>
          ) : (
            pendingSellers.map((seller: any) => (
              <Card key={seller.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-bold">{seller.storeName}</h3>
                      <p className="text-sm text-muted-foreground">{seller.storeDescription}</p>
                      <p className="text-sm">Тип: {seller.type}</p>
                      <p className="text-sm">Владелец: {seller.user.name}</p>
                      {seller.address && <p className="text-sm">Адрес: {seller.address}</p>}
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => verifySeller(seller.id)} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Одобрить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Products */}
        <TabsContent value="products" className="space-y-4">
          {pendingProducts.length === 0 ? (
            <Card><CardContent className="p-6">Нет товаров на проверке</CardContent></Card>
          ) : (
            pendingProducts.map((product: any) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <p className="text-sm font-semibold">{product.price} ₽</p>
                      <p className="text-sm">Магазин: {product.shop.name}</p>
                      <p className="text-sm">Продавец: {product.shop.user?.name}</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => approveProduct(product.id)} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Одобрить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* All Users */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                {allUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.driverProfile && <Badge variant="secondary">Водитель</Badge>}
                        {user.sellerProfile && <Badge variant="secondary">Продавец</Badge>}
                        {user.isAdmin && <Badge>Админ</Badge>}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Заказов: {user._count?.orders || 0}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promocodes */}
        <TabsContent value="promocodes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Управление промокодами</CardTitle>
                  <CardDescription>Создавайте и управляйте промокодами для пользователей</CardDescription>
                </div>
                <Dialog open={showNewPromoDialog} onOpenChange={setShowNewPromoDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать промокод
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый промокод</DialogTitle>
                      <DialogDescription>
                        Заполните данные для создания нового промокода
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Код промокода</Label>
                        <Input
                          id="code"
                          placeholder="YAKGO2024"
                          value={newPromo.code}
                          onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Тип промокода</Label>
                        <Select
                          value={newPromo.type}
                          onValueChange={(value) => setNewPromo({ ...newPromo, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount_percent">Скидка %</SelectItem>
                            <SelectItem value="discount_fixed">Скидка ₽</SelectItem>
                            <SelectItem value="bonus_balance">Бонус на баланс</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">
                          Значение {newPromo.type === 'discount_percent' ? '(%)' : '(₽)'}
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          placeholder="10"
                          value={newPromo.value}
                          onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxUses">Макс. использований (0 = безлимит)</Label>
                        <Input
                          id="maxUses"
                          type="number"
                          placeholder="100"
                          value={newPromo.maxUses}
                          onChange={(e) => setNewPromo({ ...newPromo, maxUses: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiresAt">Срок действия (опционально)</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={newPromo.expiresAt}
                          onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewPromoDialog(false)}>
                        Отмена
                      </Button>
                      <Button onClick={createPromocode} disabled={!newPromo.code}>
                        Создать
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {promocodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет созданных промокодов
                </p>
              ) : (
                <div className="space-y-3">
                  {promocodes.map((promo: any) => (
                    <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded font-mono font-bold">
                            {promo.code}
                          </code>
                          <Badge variant={promo.active ? 'default' : 'secondary'}>
                            {promo.active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {promo.type === 'discount_percent' && `Скидка ${promo.value}%`}
                          {promo.type === 'discount_fixed' && `Скидка ${promo.value} ₽`}
                          {promo.type === 'bonus_balance' && `Бонус ${promo.value} ₽ на баланс`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Использований: {promo.usedCount}/{promo.maxUses || '∞'}
                          {promo.expiresAt && ` • До ${new Date(promo.expiresAt).toLocaleDateString('ru-RU')}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
