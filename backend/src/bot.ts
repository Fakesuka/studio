import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MINI_APP_URL = process.env.FRONTEND_URL || 'http://localhost:9002';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

let bot: TelegramBot | null = null;

export function startBot() {
  try {
    // Create bot instance
    bot = new TelegramBot(BOT_TOKEN!, { polling: true });

    console.log('🤖 YakGo Telegram Bot started successfully!');
    console.log(`🔗 Mini App URL: ${MINI_APP_URL}`);

    // Handle /start command
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'друг';

      const welcomeMessage = `
Привет, ${firstName}! 👋

Добро пожаловать в *YakGo* - ваш незаменимый помощник на дорогах республики Саха (Якутия)!

❄️ *Почему YakGo?*
Мы знаем, как сложно бывает в суровых якутских условиях:
• -50°C и машина не заводится? Вызовите отогрев за минуту!
• Кончилось топливо на трассе? Доставим в любую точку!
• Нужна эвакуация или техпомощь? Водители уже рядом!

🚗 *Услуги для водителей:*
• Отогрев автомобилей
• Доставка топлива
• Техническая помощь на дороге
• Эвакуация автомобилей

🛒 *Маркетплейс:*
• Автозапчасти и аксессуары
• Зимние товары для авто
• Товары от местных продавцов
• Быстрая доставка по городу

💰 *Зарабатывайте с нами:*
• Станьте водителем и помогайте автомобилистам
• Откройте свой магазин в маркетплейсе
• Получайте честные выплаты (90% вам, 10% сервису)

🎁 *Бонусы:*
• Реферальная программа - приглашайте друзей
• Промокоды и скидки
• Накопительная система бонусов

🗺️ *Города обслуживания:*
Якутск, Мирный, Айхал, Удачный и другие города РС(Я)

Нажмите на кнопку ниже, чтобы начать! 👇
      `.trim();

      bot!.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть YakGo',
                web_app: { url: MINI_APP_URL },
              },
            ],
          ],
        },
      });
    });

    // Handle /help command
    bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;

      const helpMessage = `
*Как пользоваться YakGo:*

🚕 *Для пассажиров:*
• Откройте приложение
• Выберите тип услуги
• Укажите место и описание
• Дождитесь водителя

🚗 *Для водителей:*
• Зарегистрируйтесь как водитель
• Просматривайте доступные заказы
• Принимайте заказы и зарабатывайте

🛍️ *Для покупателей:*
• Просматривайте товары в маркетплейсе
• Добавляйте в корзину
• Оформляйте заказ

🏪 *Для продавцов:*
• Зарегистрируйтесь как продавец
• Добавляйте свои товары
• Получайте заказы

Нужна помощь? Напишите нам!
      `.trim();

      bot!.sendMessage(chatId, helpMessage, {
        parse_mode: 'Markdown',
      });
    });

    // Handle any text message (for debugging)
    bot.on('message', (msg) => {
      // Skip if it's a command
      if (msg.text?.startsWith('/')) {
        return;
      }

      console.log(`📨 Message from ${msg.from?.first_name}: ${msg.text}`);
    });

    // Handle errors
    bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
    });

    return bot;
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    throw error;
  }
}

export function stopBot() {
  if (bot) {
    bot.stopPolling();
    console.log('🛑 Bot stopped');
  }
}

// If this file is run directly
if (require.main === module) {
  startBot();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    stopBot();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down bot...');
    stopBot();
    process.exit(0);
  });
}
