import dotenv from 'dotenv';

dotenv.config();

/**
 * Simple Telegram Bot for YakGo Mini App
 * 
 * To run this bot:
 * 1. Create a bot using @BotFather on Telegram
 * 2. Get your bot token
 * 3. Set TELEGRAM_BOT_TOKEN in .env
 * 4. Run: npx tsx src/bot.ts
 * 
 * To configure Mini App:
 * 1. Talk to @BotFather
 * 2. Send /mybots
 * 3. Select your bot
 * 4. Go to "Bot Settings" > "Menu Button"
 * 5. Send the URL where your frontend is hosted
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MINI_APP_URL = process.env.FRONTEND_URL || 'http://localhost:9002';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

const maskedToken = BOT_TOKEN.substring(0, 10) + '...';

console.log(`
╔══════════════════════════════════════════════════════╗
║          YakGo Telegram Bot Setup Guide             ║
╚══════════════════════════════════════════════════════╝

✅ Bot Token: ${maskedToken}

📝 To configure your Telegram Mini App:

1. Open Telegram and find @BotFather
2. Send the command: /mybots
3. Select your bot from the list
4. Choose "Bot Settings" > "Menu Button"  
5. Click "Edit Menu Button URL"
6. Send this URL: ${MINI_APP_URL}
7. Send button text: "Открыть YakGo"

🚀 Once configured, users can:
   - Open your bot in Telegram
   - Click the menu button at the bottom
   - Start using YakGo Mini App!

💡 For production:
   - Deploy frontend to a public HTTPS URL
   - Update FRONTEND_URL in backend/.env
   - Update Mini App URL in @BotFather

🔗 Mini App URL: ${MINI_APP_URL}
🤖 Bot Token: Set in .env

Press Ctrl+C to exit.
`);

// Keep the process running
setInterval(() => {
  // This keeps the script alive
}, 1000 * 60 * 60); // Check every hour
