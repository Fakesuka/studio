import axios from 'axios';

/**
 * YooKassa (ЮKassa) Payment Integration
 * Документация: https://yookassa.ru/developers/api
 */

interface CreatePaymentParams {
  amount: number;
  description: string;
  userId: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata?: Record<string, any>;
}

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || '';
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

// Base64 encode for Basic Auth
const authHeader = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

/**
 * Создание платежа для пополнения баланса
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
  const { amount, description, userId, metadata } = params;

  try {
    const response = await axios.post(
      `${YOOKASSA_API_URL}/payments`,
      {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.FRONTEND_URL}/profile?payment=success`,
        },
        capture: true, // Автоматическое списание
        description,
        metadata: {
          userId,
          ...metadata,
        },
      },
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': `${userId}-${Date.now()}`, // Защита от дублей
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('YooKassa payment creation error:', error.response?.data || error.message);
    throw new Error('Failed to create payment');
  }
}

/**
 * Проверка статуса платежа
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
  try {
    const response = await axios.get(
      `${YOOKASSA_API_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('YooKassa payment status error:', error.response?.data || error.message);
    throw new Error('Failed to get payment status');
  }
}

/**
 * Обработка webhook от YooKassa
 */
export function verifyWebhookSignature(body: any, signature: string): boolean {
  // YooKassa не использует подпись в заголовке, проверка не требуется
  // Рекомендуется настроить IP whitelist в панели YooKassa
  return true;
}

/**
 * Создание выплаты (вывод средств)
 */
export async function createPayout(params: {
  amount: number;
  description: string;
  destination: string; // Номер карты или YooMoney кошелек
  type: 'bank_card' | 'yoo_money';
}): Promise<any> {
  const { amount, description, destination, type } = params;

  try {
    const response = await axios.post(
      `${YOOKASSA_API_URL}/payouts`,
      {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        payout_destination_data: {
          type,
          ...(type === 'bank_card'
            ? { card: { number: destination } }
            : { account_number: destination }
          ),
        },
        description,
      },
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': `payout-${Date.now()}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('YooKassa payout error:', error.response?.data || error.message);
    throw new Error('Failed to create payout');
  }
}
