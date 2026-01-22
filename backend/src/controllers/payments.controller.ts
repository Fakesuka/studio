import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createPayment, getPaymentStatus, createPayout } from '../utils/yookassa';
import { AuthRequest } from '../middleware/auth';

/**
 * Создать платеж для пополнения баланса
 * POST /api/payments/create
 */
export async function createTopUpPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      res.status(400).json({ error: 'Минимальная сумма пополнения - 100 рублей' });
      return;
    }

    if (amount > 100000) {
      res.status(400).json({ error: 'Максимальная сумма пополнения - 100,000 рублей' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Создаем платеж через YooKassa
    const payment = await createPayment({
      amount,
      description: `Пополнение баланса YakGo - ${user.name}`,
      userId: user.id,
      metadata: {
        type: 'balance_topup',
      },
    });

    // Сохраняем платеж в БД
    await prisma.payment.create({
      data: {
        paymentId: payment.id,
        userId: user.id,
        amount,
        status: payment.status,
        type: 'topup',
        provider: 'yookassa',
        metadata: payment.metadata,
      },
    });

    res.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      amount: payment.amount,
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
}

/**
 * Webhook для обработки платежей от YooKassa
 * POST /api/payments/webhook/yookassa
 */
export async function handleYooKassaWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { type, object } = req.body;

    if (type === 'payment.succeeded') {
      const paymentId = object.id;
      const userId = object.metadata?.userId;
      const amount = parseFloat(object.amount.value);

      if (!userId) {
        console.error('No userId in payment metadata');
        res.status(400).json({ error: 'Invalid payment metadata' });
        return;
      }

      // Обновляем статус платежа
      await prisma.payment.update({
        where: { paymentId },
        data: { status: 'succeeded' },
      });

      // Пополняем баланс пользователя
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Создаем запись в истории транзакций
      await prisma.transaction.create({
        data: {
          userId,
          type: 'topup',
          amount,
          description: `Пополнение баланса через YooKassa`,
          paymentId,
        },
      });

      console.log(`✅ Payment ${paymentId} succeeded. User ${userId} balance +${amount} RUB`);
    }

    if (type === 'payment.canceled') {
      const paymentId = object.id;

      await prisma.payment.update({
        where: { paymentId },
        data: { status: 'canceled' },
      });

      console.log(`❌ Payment ${paymentId} canceled`);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Проверить статус платежа
 * GET /api/payments/:paymentId/status
 */
export async function checkPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { paymentId },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.userId !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Получаем актуальный статус от YooKassa
    const yooKassaPayment = await getPaymentStatus(paymentId);

    // Обновляем статус в БД
    if (payment.status !== yooKassaPayment.status) {
      await prisma.payment.update({
        where: { paymentId },
        data: { status: yooKassaPayment.status },
      });
    }

    res.json({
      paymentId,
      status: yooKassaPayment.status,
      amount: yooKassaPayment.amount,
    });
  } catch (error: any) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
}

/**
 * Запрос на вывод средств
 * POST /api/payments/withdraw
 */
export async function requestWithdrawal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount, destination, type } = req.body;

    if (!amount || amount < 500) {
      res.status(400).json({ error: 'Минимальная сумма вывода - 500 рублей' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.balance < amount) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    // Проверяем, является ли пользователь водителем или продавцом
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile && !sellerProfile) {
      res.status(403).json({ error: 'Вывод доступен только водителям и продавцам' });
      return;
    }

    // Создаем запрос на вывод (в реальности нужна модерация)
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        destination,
        destinationType: type,
        status: 'pending',
      },
    });

    // Замораживаем средства
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'withdrawal_pending',
        amount: -amount,
        description: `Запрос на вывод средств`,
      },
    });

    res.json({
      withdrawalId: withdrawal.id,
      status: 'pending',
      message: 'Запрос на вывод принят. Средства будут переведены в течение 1-3 рабочих дней.',
    });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
}

/**
 * История транзакций пользователя
 * GET /api/payments/transactions
 */
export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ transactions });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
}
