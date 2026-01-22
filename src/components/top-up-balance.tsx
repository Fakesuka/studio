'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

interface TopUpBalanceProps {
  onSuccess?: () => void;
}

export default function TopUpBalance({ onSuccess }: TopUpBalanceProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount < 100) {
      setError('Минимальная сумма пополнения - 100 рублей');
      return;
    }

    if (numAmount > 100000) {
      setError('Максимальная сумма пополнения - 100,000 рублей');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const initData = window.Telegram?.WebApp?.initData;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData || '',
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Открываем страницу оплаты в новом окне
      if (data.confirmationUrl) {
        window.open(data.confirmationUrl, '_blank');

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании платежа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Пополнить баланс
        </CardTitle>
        <CardDescription>
          Пополните баланс для оплаты услуг и покупок в маркетплейсе
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Выберите сумму:
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset.toString() ? 'default' : 'outline'}
                onClick={() => setAmount(preset.toString())}
                className="w-full"
              >
                {preset} ₽
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Или введите свою сумму:
          </label>
          <Input
            type="number"
            placeholder="Введите сумму"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={100}
            max={100000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Минимум 100 ₽, максимум 100,000 ₽
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleTopUp}
          disabled={isLoading || !amount}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Создание платежа...
            </>
          ) : (
            <>
              Пополнить на {amount} ₽
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💳 Оплата через ЮKassa (Visa, MasterCard, Мир)</p>
          <p>✅ Безопасная оплата с 3D-Secure</p>
          <p>⚡ Зачисление моментально после оплаты</p>
        </div>
      </CardContent>
    </Card>
  );
}
