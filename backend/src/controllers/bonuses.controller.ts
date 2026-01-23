import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { notifyReferralBonus, notifyPromocodeApplied } from '../utils/telegram-notifications';

/**
 * Применить промокод к заказу
 * POST /api/bonuses/apply-promocode
 */
export async function applyPromocode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      res.status(400).json({ error: 'Code and order amount are required' });
      return;
    }

    // Находим промокод
    const promocode = await prisma.promocode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promocode) {
      res.status(404).json({ error: 'Промокод не найден' });
      return;
    }

    if (!promocode.active) {
      res.status(400).json({ error: 'Промокод неактивен' });
      return;
    }

    if (promocode.expiresAt && promocode.expiresAt < new Date()) {
      res.status(400).json({ error: 'Промокод истек' });
      return;
    }

    if (promocode.maxUses && promocode.usedCount >= promocode.maxUses) {
      res.status(400).json({ error: 'Промокод исчерпан' });
      return;
    }

    // Проверяем, использовал ли пользователь этот промокод
    const alreadyUsed = await prisma.promocodeUsage.findFirst({
      where: {
        userId: req.user!.id,
        promocodeId: promocode.id,
      },
    });

    if (alreadyUsed) {
      res.status(400).json({ error: 'Вы уже использовали этот промокод' });
      return;
    }

    // Рассчитываем скидку
    let discountAmount = 0;

    if (promocode.type === 'discount_percent') {
      discountAmount = orderAmount * (promocode.value / 100);
    } else if (promocode.type === 'discount_fixed') {
      discountAmount = Math.min(promocode.value, orderAmount);
    } else if (promocode.type === 'bonus_balance') {
      // Зачисляем бонус на баланс
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          balance: {
            increment: promocode.value,
          },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: req.user!.id,
          type: 'promocode_bonus',
          amount: promocode.value,
          description: `Бонус по промокоду ${code}`,
        },
      });

      discountAmount = 0; // Нет скидки на заказ, бонус на баланс
    }

    res.json({
      success: true,
      promocode: {
        code: promocode.code,
        type: promocode.type,
        value: promocode.value,
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
    });
  } catch (error: any) {
    console.error('Apply promocode error:', error);
    res.status(500).json({ error: 'Failed to apply promocode' });
  }
}

/**
 * Подтвердить использование промокода (вызывается после создания заказа)
 * POST /api/bonuses/confirm-promocode-usage
 */
export async function confirmPromocodeUsage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, orderId, discountAmount } = req.body;

    const promocode = await prisma.promocode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promocode) {
      res.status(404).json({ error: 'Promocode not found' });
      return;
    }

    // Создаем запись использования
    await prisma.promocodeUsage.create({
      data: {
        userId: req.user!.id,
        promocodeId: promocode.id,
        orderId,
        discountAmount,
      },
    });

    // Увеличиваем счетчик использований
    await prisma.promocode.update({
      where: { id: promocode.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    // Отправляем уведомление
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (user && discountAmount > 0) {
      await notifyPromocodeApplied(user.telegramId, discountAmount, code);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Confirm promocode usage error:', error);
    res.status(500).json({ error: 'Failed to confirm promocode usage' });
  }
}

/**
 * Получить реферальную ссылку
 * GET /api/bonuses/referral-link
 */
export async function getReferralLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'YakGoBot';
    const referralLink = `https://t.me/${botUsername}?start=ref_${req.user!.id}`;

    // Подсчитываем статистику рефералов
    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user!.id },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    const totalReferrals = referrals.length;
    const totalBonusEarned = referrals.reduce((sum, ref) => sum + ref.bonusAmount, 0);

    res.json({
      referralLink,
      stats: {
        totalReferrals,
        totalBonusEarned,
      },
      referrals: referrals.map((ref) => ({
        userName: ref.referred?.name,
        bonusAmount: ref.bonusAmount,
        joinedAt: ref.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Get referral link error:', error);
    res.status(500).json({ error: 'Failed to get referral link' });
  }
}

/**
 * Зарегистрировать реферала (вызывается при первом входе нового пользователя)
 * POST /api/bonuses/register-referral
 */
export async function registerReferral(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { referrerId } = req.body;

    if (!referrerId) {
      res.status(400).json({ error: 'Referrer ID is required' });
      return;
    }

    // Проверяем, что реферер существует
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
    });

    if (!referrer) {
      res.status(404).json({ error: 'Referrer not found' });
      return;
    }

    // Проверяем, что пользователь еще не зарегистрирован как реферал
    const existingReferral = await prisma.referral.findUnique({
      where: { referredId: req.user!.id },
    });

    if (existingReferral) {
      res.status(400).json({ error: 'Already registered as referral' });
      return;
    }

    // Создаем реферальную связь
    const bonusAmount = 100; // 100 рублей за приглашение

    await prisma.referral.create({
      data: {
        referrerId,
        referredId: req.user!.id,
        bonusGiven: true,
        bonusAmount,
      },
    });

    // Начисляем бонус реферреру
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        balance: {
          increment: bonusAmount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: referrerId,
        type: 'referral_bonus',
        amount: bonusAmount,
        description: `Бонус за приглашение пользователя`,
      },
    });

    // Начисляем бонус новому пользователю
    const newUserBonus = 50; // 50 рублей приветственный бонус

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        balance: {
          increment: newUserBonus,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        type: 'welcome_bonus',
        amount: newUserBonus,
        description: `Приветственный бонус`,
      },
    });

    // Отправляем уведомления
    const newUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (newUser) {
      await notifyReferralBonus(referrer.telegramId, bonusAmount, newUser.name);
    }

    res.json({
      success: true,
      referrerBonus: bonusAmount,
      yourBonus: newUserBonus,
    });
  } catch (error: any) {
    console.error('Register referral error:', error);
    res.status(500).json({ error: 'Failed to register referral' });
  }
}

/**
 * Получить доступные промокоды (для админов - создание)
 * Admin only
 */
export async function createPromocode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, type, value, maxUses, expiresAt } = req.body;

    if (!code || !type || !value) {
      res.status(400).json({ error: 'Code, type, and value are required' });
      return;
    }

    const promocode = await prisma.promocode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({ promocode });
  } catch (error: any) {
    console.error('Create promocode error:', error);
    res.status(500).json({ error: 'Failed to create promocode' });
  }
}

/**
 * Получить все промокоды (admin)
 * GET /api/bonuses/promocodes
 */
export async function getAllPromocodes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const promocodes = await prisma.promocode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ promocodes });
  } catch (error: any) {
    console.error('Get all promocodes error:', error);
    res.status(500).json({ error: 'Failed to get promocodes' });
  }
}
