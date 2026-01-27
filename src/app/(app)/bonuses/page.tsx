'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Gift, Users, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface ReferralData {
  referralLink: string;
  stats: {
    totalReferrals: number;
    totalBonusEarned: number;
  };
  referrals: {
    userName: string;
    bonusAmount: number;
    joinedAt: Date;
  }[];
}

export default function BonusesPage() {
  const [promocode, setPromocode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const data = await api.request('/bonuses/referral-link');
      setReferralData(data);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    }
  };

  const handleApplyPromocode = async () => {
    if (!promocode.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите промокод',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.applyPromocode(promocode);

      const bonusText = result.promocode?.type === 'bonus_balance'
        ? `${result.promocode.value} ₽ на баланс`
        : result.discountAmount
        ? `скидка ${result.discountAmount} ₽`
        : 'бонус активирован';

      toast({
        title: 'Промокод применен!',
        description: `Вы получили ${bonusText}`,
      });

      setPromocode('');
      // Reload balance
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось применить промокод',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: 'Скопировано!',
        description: 'Реферальная ссылка скопирована в буфер обмена',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Бонусы и реферальная программа</h1>
        <p className="text-muted-foreground mt-2">
          Приглашайте друзей и получайте бонусы!
        </p>
      </div>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Реферальная программа
          </CardTitle>
          <CardDescription>
            Приглашайте друзей и получайте 50 ₽ за каждого нового пользователя
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralData && (
            <>
              <div>
                <Label>Ваша реферальная ссылка</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={referralData.referralLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Всего рефералов
                  </p>
                  <p className="text-2xl font-bold">
                    {referralData.stats?.totalReferrals ?? 0}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Заработано бонусов
                  </p>
                  <p className="text-2xl font-bold">
                    {referralData.stats?.totalBonusEarned ?? 0} ₽
                  </p>
                </div>
              </div>

              {referralData.referrals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Ваши рефералы:</h3>
                  <div className="space-y-2">
                    {referralData.referrals.map((ref, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{ref.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ref.joinedAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          +{ref.bonusAmount} ₽
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Promocode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Промокод
          </CardTitle>
          <CardDescription>
            Введите промокод чтобы получить бонус
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Введите промокод"
                value={promocode}
                onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleApplyPromocode} disabled={isLoading}>
              {isLoading ? 'Проверка...' : 'Применить'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Как это работает?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Реферальная программа:</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
              <li>Поделитесь своей реферальной ссылкой с друзьями</li>
              <li>
                Когда друг регистрируется по вашей ссылке, вы получаете 50 ₽
              </li>
              <li>Бонус зачисляется автоматически на ваш баланс</li>
              <li>Количество приглашений не ограничено!</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Промокоды:</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
              <li>Получайте промокоды в наших социальных сетях</li>
              <li>Вводите промокод на этой странице</li>
              <li>Бонус зачисляется мгновенно</li>
              <li>Каждый промокод можно использовать только один раз</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
