import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

const buildWebAppButton = (path: string) => {
  if (!FRONTEND_URL) return undefined;
  return {
    inline_keyboard: [
      [
        {
          text: 'Открыть приложение',
          web_app: { url: `${FRONTEND_URL}${path}` },
        },
      ],
    ],
  };
};

/**
 * Отправить уведомление пользователю через Telegram
 */
export async function sendNotification(
  telegramId: string,
  message: string,
  options?: {
    parseMode?: 'Markdown' | 'HTML';
    disableWebPagePreview?: boolean;
    replyMarkup?: any;
  }
): Promise<boolean> {
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: telegramId,
      text: message,
      parse_mode: options?.parseMode || 'HTML',
      disable_web_page_preview: options?.disableWebPagePreview ?? true,
      reply_markup: options?.replyMarkup,
    });

    console.log(`✅ Notification sent to ${telegramId}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send Telegram notification:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Уведомление о новом заказе для водителя
 */
export async function notifyNewOrder(
  driverTelegramId: string,
  orderDetails: {
    orderId: string;
    service: string;
    location: string;
    price: number;
  }
): Promise<void> {
  const message = `
🚗 <b>Новый заказ!</b>

📋 Заказ: ${orderDetails.orderId}
🛠 Услуга: ${orderDetails.service}
📍 Адрес: ${orderDetails.location}
💰 Сумма: ${orderDetails.price.toLocaleString('ru-RU')} ₽

Откройте приложение для принятия заказа.
  `.trim();

  await sendNotification(driverTelegramId, message, {
    replyMarkup: buildWebAppButton('/driver/dashboard'),
  });
}

/**
 * Уведомление о принятии заказа водителем
 */
export async function notifyOrderAccepted(
  customerTelegramId: string,
  orderDetails: {
    orderId: string;
    driverName: string;
    vehicle: string;
    arrivalTime: number;
  }
): Promise<void> {
  const message = `
✅ <b>Водитель найден!</b>

📋 Заказ: ${orderDetails.orderId}
👨‍🔧 Водитель: ${orderDetails.driverName}
🚗 Транспорт: ${orderDetails.vehicle}
⏱ Прибудет через: ~${orderDetails.arrivalTime} минут

Водитель уже в пути!
  `.trim();

  await sendNotification(customerTelegramId, message, {
    replyMarkup: buildWebAppButton('/dashboard'),
  });
}

/**
 * Уведомление о завершении заказа
 */
export async function notifyOrderCompleted(
  telegramId: string,
  orderDetails: {
    orderId: string;
    service: string;
    price: number;
  },
  isDriver: boolean
): Promise<void> {
  const message = isDriver
    ? `
✅ <b>Заказ завершен!</b>

📋 Заказ: ${orderDetails.orderId}
💰 Ваш заработок: ${(orderDetails.price * 0.9).toLocaleString('ru-RU')} ₽
(Комиссия 10% удержана)

Средства зачислены на ваш баланс.
    `.trim()
    : `
✅ <b>Заказ выполнен!</b>

📋 Заказ: ${orderDetails.orderId}
🛠 Услуга: ${orderDetails.service}
💰 Списано: ${orderDetails.price.toLocaleString('ru-RU')} ₽

Спасибо за использование YakGo!
Пожалуйста, оцените работу водителя.
    `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton(isDriver ? '/driver/profile' : '/orders'),
  });
}

/**
 * Уведомление о новом сообщении в чате
 */
export async function notifyNewMessage(
  receiverTelegramId: string,
  messageDetails: {
    senderName: string;
    orderId: string;
    messagePreview: string;
  }
): Promise<void> {
  const preview = messageDetails.messagePreview.length > 50
    ? messageDetails.messagePreview.substring(0, 50) + '...'
    : messageDetails.messagePreview;

  const message = `
💬 <b>Новое сообщение</b>

От: ${messageDetails.senderName}
Заказ: ${messageDetails.orderId}

"${preview}"

Откройте чат в приложении для ответа.
  `.trim();

  await sendNotification(receiverTelegramId, message, {
    replyMarkup: buildWebAppButton('/orders'),
  });
}

/**
 * Уведомление о пополнении баланса
 */
export async function notifyBalanceTopUp(
  telegramId: string,
  amount: number,
  newBalance: number
): Promise<void> {
  const message = `
💰 <b>Баланс пополнен!</b>

Пополнено: +${amount.toLocaleString('ru-RU')} ₽
Новый баланс: ${newBalance.toLocaleString('ru-RU')} ₽

Спасибо за пополнение!
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/driver/profile'),
  });
}

/**
 * Уведомление о выводе средств
 */
export async function notifyWithdrawalProcessed(
  telegramId: string,
  amount: number,
  status: 'completed' | 'rejected',
  reason?: string
): Promise<void> {
  const message = status === 'completed'
    ? `
✅ <b>Вывод средств выполнен!</b>

Сумма: ${amount.toLocaleString('ru-RU')} ₽
Средства переведены на указанные реквизиты.

Ожидайте поступления в течение 1-3 рабочих дней.
    `.trim()
    : `
❌ <b>Вывод средств отклонен</b>

Сумма: ${amount.toLocaleString('ru-RU')} ₽
Причина: ${reason || 'Не указана'}

Средства возвращены на ваш баланс.
    `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/driver/profile'),
  });
}

/**
 * Уведомление о новом отзыве
 */
export async function notifyNewReview(
  telegramId: string,
  reviewDetails: {
    rating: number;
    comment?: string;
    orderId: string;
  }
): Promise<void> {
  const stars = '⭐'.repeat(reviewDetails.rating);

  const message = `
${stars} <b>Новый отзыв!</b>

Заказ: ${reviewDetails.orderId}
Оценка: ${reviewDetails.rating}/5

${reviewDetails.comment ? `Комментарий: "${reviewDetails.comment}"` : ''}

Спасибо за отличную работу!
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/driver/profile'),
  });
}

/**
 * Уведомление о приглашении по реферальной программе
 */
export async function notifyReferralBonus(
  telegramId: string,
  bonusAmount: number,
  referredUserName: string
): Promise<void> {
  const message = `
🎉 <b>Бонус за приглашение!</b>

${referredUserName} зарегистрировался по вашей ссылке!
Вы получили: +${bonusAmount.toLocaleString('ru-RU')} ₽

Продолжайте приглашать друзей и зарабатывать!
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/bonuses'),
  });
}

/**
 * Уведомление о применении промокода
 */
export async function notifyPromocodeApplied(
  telegramId: string,
  discountAmount: number,
  promocode: string
): Promise<void> {
  const message = `
🎁 <b>Промокод применен!</b>

Код: ${promocode}
Скидка: ${discountAmount.toLocaleString('ru-RU')} ₽

Ваша экономия на этом заказе!
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/bonuses'),
  });
}

export async function notifyMarketplaceOrderPlaced(
  telegramId: string,
  orderDetails: {
    orderId: string;
    total: number;
    items: { name: string; quantity: number }[];
  }
): Promise<void> {
  const itemsPreview = orderDetails.items
    .slice(0, 4)
    .map(item => `• ${item.name} × ${item.quantity}`)
    .join('\n');

  const message = `
🛍 <b>Покупка оформлена</b>

📋 Заказ: ${orderDetails.orderId}
💰 Сумма: ${orderDetails.total.toLocaleString('ru-RU')} ₽
${itemsPreview ? `\nТовары:\n${itemsPreview}` : ''}

Статус заказа можно отследить в приложении.
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/orders'),
  });
}

export async function notifyMarketplaceOrderForSeller(
  telegramId: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    total: number;
    items: { name: string; quantity: number }[];
  }
): Promise<void> {
  const itemsPreview = orderDetails.items
    .slice(0, 4)
    .map(item => `• ${item.name} × ${item.quantity}`)
    .join('\n');

  const message = `
📦 <b>Новая покупка в маркете</b>

📋 Заказ: ${orderDetails.orderId}
👤 Клиент: ${orderDetails.customerName}
💰 Сумма: ${orderDetails.total.toLocaleString('ru-RU')} ₽
${itemsPreview ? `\nТовары:\n${itemsPreview}` : ''}

Откройте приложение для обработки заказа.
  `.trim();

  await sendNotification(telegramId, message, {
    replyMarkup: buildWebAppButton('/my-store'),
  });
}
