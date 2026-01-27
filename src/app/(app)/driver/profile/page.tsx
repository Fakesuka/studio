'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Snowflake, User, Wallet, Plus, ArrowRight, Star, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import TopUpBalance from '@/components/top-up-balance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  thisMonthOrders: number;
  thisMonthEarnings: number;
}

export default function DriverProfilePage() {
  const { isDriver, driverProfile, isContextLoading, balance, refreshData } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('card');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!isContextLoading && !isDriver) {
      router.replace('/driver/register');
    }
  }, [isDriver, isContextLoading, router]);

  useEffect(() => {
    if (driverProfile?.id) {
      loadReviews();
      loadAnalytics();
    }
  }, [driverProfile?.id]);

  const loadReviews = async () => {
    try {
      const userId = driverProfile?.userId || driverProfile?.id;
      if (!userId) return;

      const data = await api.getUserReviews(userId);
      setReviews(data.reviews || []);
      setReviewStats(data.stats || null);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await api.getDriverAnalytics();
      // Map backend response to frontend Analytics interface
      if (data && data.summary) {
        setAnalytics({
          totalOrders: data.summary.totalOrders ?? 0,
          completedOrders: data.summary.totalOrders ?? 0, // All returned orders are completed
          totalEarnings: data.summary.earnings ?? 0,
          averageRating: data.summary.rating ?? 0,
          thisMonthOrders: data.summary.totalOrders ?? 0,
          thisMonthEarnings: data.summary.earnings ?? 0,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    if (amount > (driverProfile?.balance ?? 0)) {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно средств на балансе',
        variant: 'destructive',
      });
      return;
    }

    if (!withdrawDetails) {
      toast({
        title: 'Ошибка',
        description: 'Заполните реквизиты для вывода',
        variant: 'destructive',
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      await api.requestWithdrawal(amount, withdrawMethod, { details: withdrawDetails });
      toast({
        title: 'Заявка создана!',
        description: 'Вывод средств будет обработан в течение 1-3 рабочих дней.',
      });
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать заявку на вывод',
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isContextLoading || !isDriver || !driverProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Snowflake className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const rating = driverProfile.rating ?? reviewStats?.averageRating ?? 0;
  const totalReviews = reviewStats?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Профиль водителя</h1>
        <p className="text-muted-foreground">
          Управление вашим профилем, кошельком и статистикой.
        </p>
      </div>

      {/* Рейтинг и статус */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {driverProfile.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{rating.toFixed(1)}</span>
              </div>
              <Badge variant={driverProfile.verified ? 'default' : 'secondary'}>
                {driverProfile.verified ? 'Верифицирован' : 'На проверке'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Автомобиль</p>
              <p className="font-medium">{driverProfile.vehicle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Статус</p>
              <p className="font-medium">{driverProfile.legalStatus}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Услуги</p>
            <div className="flex flex-wrap gap-2">
              {driverProfile.services.map(service => (
                <Badge key={service} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Аналитика */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Выполнено</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completedOrders}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Заработано всего</p>
                <p className="text-2xl font-bold">
                  {analytics.totalEarnings?.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">В этом месяце</p>
                <p className="text-2xl font-bold">
                  {analytics.thisMonthEarnings?.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кошелек */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Кошелек
          </CardTitle>
          <CardDescription>Ваш текущий баланс и операции.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {(driverProfile.balance ?? 0).toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            })}
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button className="flex-1" onClick={() => setShowTopUpDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Пополнить
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowWithdrawDialog(true)}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Вывести
          </Button>
        </CardFooter>
      </Card>

      {/* Отзывы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Отзывы ({totalReviews})
          </CardTitle>
          {reviewStats && (
            <CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{reviewStats.averageRating?.toFixed(1)}</span>
                </div>
                <div className="flex gap-1 text-sm text-muted-foreground">
                  {[5, 4, 3, 2, 1].map(star => (
                    <span key={star}>
                      {star}★: {reviewStats.ratingsDistribution?.[star] || 0}
                    </span>
                  ))}
                </div>
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">
                Пока нет отзывов
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map(review => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {review.fromUser.avatarUrl ? (
                          <img
                            src={review.fromUser.avatarUrl}
                            alt={review.fromUser.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium">{review.fromUser.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог пополнения */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пополнение баланса</DialogTitle>
            <DialogDescription>
              Пополните баланс для принятия заказов
            </DialogDescription>
          </DialogHeader>
          <TopUpBalance onSuccess={() => {
            setShowTopUpDialog(false);
            refreshData();
          }} />
        </DialogContent>
      </Dialog>

      {/* Диалог вывода */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вывод средств</DialogTitle>
            <DialogDescription>
              Доступно: {(driverProfile.balance ?? 0).toLocaleString('ru-RU')} ₽
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Сумма вывода (₽)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Способ вывода</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите способ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Банковская карта</SelectItem>
                  <SelectItem value="sbp">СБП</SelectItem>
                  <SelectItem value="yoomoney">ЮMoney</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {withdrawMethod === 'card' && 'Номер карты'}
                {withdrawMethod === 'sbp' && 'Номер телефона'}
                {withdrawMethod === 'yoomoney' && 'Номер кошелька'}
              </Label>
              <Input
                placeholder={
                  withdrawMethod === 'card' ? '0000 0000 0000 0000' :
                  withdrawMethod === 'sbp' ? '+7 (000) 000-00-00' :
                  '410000000000000'
                }
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? 'Обработка...' : 'Вывести'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
