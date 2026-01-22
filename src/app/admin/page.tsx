'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Users, Car, Store, Package, ShoppingCart, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, driversData, sellersData, productsData, usersData] = await Promise.all([
        fetch('/api/admin/dashboard/stats', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/drivers/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/sellers/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/products/pending', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/users?limit=100', { headers: getHeaders() }).then(r => r.json()),
      ]);
      setStats(statsData);
      setPendingDrivers(driversData);
      setPendingSellers(sellersData);
      setPendingProducts(productsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
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
      </Tabs>
    </div>
  );
}
