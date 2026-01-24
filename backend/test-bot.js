// Простой тест Telegram бота
require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен');
  console.log('Добавьте токен в backend/.env файл:');
  console.log('TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather');
  process.exit(1);
}

console.log('🤖 Проверяю токен бота...');
console.log('Токен:', BOT_TOKEN.substring(0, 20) + '...');

// Проверяем токен через API Telegram
axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
  .then(response => {
    const data = response.data;
    if (data.ok) {
      console.log('\n✅ Токен ПРАВИЛЬНЫЙ!');
      console.log('📋 Информация о боте:');
      console.log('   - ID:', data.result.id);
      console.log('   - Имя:', data.result.first_name);
      console.log('   - Username: @' + data.result.username);
      console.log('   - Может присоединяться к группам:', data.result.can_join_groups ? 'Да' : 'Нет');
      console.log('   - Может читать сообщения:', data.result.can_read_all_group_messages ? 'Да' : 'Нет');
      console.log('\n📱 Откройте Telegram и найдите бота: @' + data.result.username);
      console.log('   Отправьте команду /start\n');
    } else {
      console.error('\n❌ Токен НЕПРАВИЛЬНЫЙ или НЕДЕЙСТВИТЕЛЬНЫЙ!');
      console.error('Ошибка:', data.description);
      console.log('\n💡 Получите новый токен у @BotFather в Telegram:');
      console.log('   1. Напишите @BotFather');
      console.log('   2. Отправьте команду /newbot');
      console.log('   3. Следуйте инструкциям');
      console.log('   4. Скопируйте токен и добавьте в .env файл\n');
    }
  })
  .catch(error => {
    console.error('\n❌ Ошибка при проверке токена:', error.message);
    console.log('Проверьте подключение к интернету\n');
  });
