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

Добро пожаловать в *YakGo* - ваш помощник для поездок и покупок в Якутске! 🚗🛍️

🚕 *Заказывайте поездки*
Быстро найдите водителя для любой задачи

🛒 *Делайте покупки*
Магазины и товары от местных продавцов

💰 *Зарабатывайте*
Станьте водителем или откройте свой магазин

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
