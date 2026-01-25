# Настройка переменных окружения YakGo

## 🚨 КРИТИЧЕСКИ ВАЖНО ДЛЯ РАБОТЫ ПРИЛОЖЕНИЯ

Без правильных переменных окружения приложение **НЕ БУДЕТ РАБОТАТЬ**.

## 📋 Шаг 1: Получите URL Backend из Railway

1. Откройте [Railway Dashboard](https://railway.app)
2. Выберите ваш проект YakGo
3. Кликните на **backend** сервис
4. Перейдите во вкладку **Settings**
5. Найдите секцию **Domains**
6. Скопируйте URL (например: `yakgo-backend-production.up.railway.app`)

⚠️ **Не используйте placeholder URL!** Замените на реальный!

## 📋 Шаг 2: Настройте Vercel (Frontend)

### Способ 1: Через Vercel Dashboard (Рекомендуется)

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте переменные для **Production**:

```bash
NEXT_PUBLIC_API_URL=https://ваш-backend-url.railway.app/api
NEXT_PUBLIC_WS_URL=wss://ваш-backend-url.railway.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotName
```

**Пример с реальным URL:**
```bash
NEXT_PUBLIC_API_URL=https://yakgo-backend-production.up.railway.app/api
NEXT_PUBLIC_WS_URL=wss://yakgo-backend-production.up.railway.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YakGoBot
```

5. Нажмите **Save**
6. Перейдите во вкладку **Deployments**
7. Нажмите **...** на последнем деплое → **Redeploy**

### Способ 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Подключитесь к проекту
vercel link

# Добавьте переменные
vercel env add NEXT_PUBLIC_API_URL production
# Введите: https://ваш-backend-url.railway.app/api

vercel env add NEXT_PUBLIC_WS_URL production
# Введите: wss://ваш-backend-url.railway.app

vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME production
# Введите: YourBotName

# Редеплой
vercel --prod
```

## 📋 Шаг 3: Настройте Railway (Backend)

1. Откройте [Railway Dashboard](https://railway.app)
2. Выберите ваш проект
3. Кликните на **backend** сервис
4. Перейдите во вкладку **Variables**
5. Убедитесь что настроены:

```bash
# Database (должен быть автоматически)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server
PORT=3001
NODE_ENV=production

# JWT Secret (сгенерируйте уникальный)
JWT_SECRET=вашсекретныйключминимум32символа

# Telegram (из @BotFather)
TELEGRAM_BOT_TOKEN=8518968975:AAG...ваш_токен
TELEGRAM_BOT_SECRET=your-bot-secret

# CORS - URL фронтенда (ИЗ VERCEL!)
FRONTEND_URL=https://ваш-frontend.vercel.app

# YooKassa (опционально)
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
```

6. После изменений Railway автоматически сделает редеплой

## ✅ Шаг 4: Проверка

### Проверка Backend

Откройте в браузере:
```
https://ваш-backend-url.railway.app/health
```

**Ожидаемый результат:**
```json
{
  "status": "ok",
  "message": "YakGo API is running",
  "database": "connected",
  "userCount": 0
}
```

❌ **Если видите ошибку или страница не открывается:**
- Backend не запущен - проверьте Railway Deployments
- URL неправильный - проверьте Domains в Railway

### Проверка Frontend → Backend

1. Откройте бота в Telegram
2. Нажмите F12 (консоль разработчика)
3. Зайдите в любой раздел (например, Профиль)
4. В консоли должны быть логи:

```
[API] Request to /users/profile { hasInitData: true }
[API] Response from /users/profile: { status: 200, ok: true }
```

❌ **Если видите:**
```
[API] Exception: TypeError: Failed to fetch
```

**Причина:** Frontend не может подключиться к backend

**Решение:**
1. Проверьте `NEXT_PUBLIC_API_URL` в Vercel
2. Убедитесь что это реальный URL (не placeholder!)
3. Убедитесь что backend запущен (откройте `/health`)
4. Сделайте редеплой frontend после изменения переменных

### Проверка через тестовую страницу

1. Откройте в боте:
   ```
   https://ваш-frontend.vercel.app/test
   ```

2. Нажмите **Test Backend Health**

3. Должны увидеть:
   ```json
   {
     "backend": {
       "health": {
         "success": true,
         "data": { "status": "ok", ... }
       }
     }
   }
   ```

## 🔧 Для локальной разработки

Создайте файл `.env.local`:

```bash
# Скопируйте из примера
cp .env.example .env.local

# Отредактируйте (оставьте localhost для локальной разработки)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Запустите backend локально:
```bash
cd backend
npm run dev
```

Запустите frontend локально:
```bash
npm run dev
```

## 🚨 Частые ошибки

### Ошибка 1: "Failed to fetch"

**Причина:** Неправильный `NEXT_PUBLIC_API_URL`

**Решение:**
- Должен быть: `https://backend-url.railway.app/api` (с `/api`!)
- НЕ должно быть: `http://` (только `https://`)
- НЕ должно быть: двойных слешей `//api`

### Ошибка 2: "No authorization data provided"

**Причина:** Открыто не через Telegram

**Решение:**
- Откройте через бота в Telegram
- Не открывайте URL напрямую в браузере

### Ошибка 3: "Invalid authorization data"

**Причина:** Неправильный `TELEGRAM_BOT_TOKEN` в Railway

**Решение:**
- Проверьте токен из @BotFather
- Должен быть формата: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Ошибка 4: CORS error

**Причина:** Неправильный `FRONTEND_URL` в Railway

**Решение:**
- Должен быть URL фронтенда из Vercel
- Без слеша в конце
- После изменения нужен редеплой backend

## 📝 Чеклист

- [ ] Получил реальный URL backend из Railway
- [ ] Настроил `NEXT_PUBLIC_API_URL` в Vercel (с `/api`)
- [ ] Настроил `NEXT_PUBLIC_WS_URL` в Vercel (с `wss://`)
- [ ] Настроил `TELEGRAM_BOT_TOKEN` в Railway
- [ ] Настроил `FRONTEND_URL` в Railway
- [ ] Сделал редеплой frontend в Vercel
- [ ] Проверил `/health` - отвечает 200 OK
- [ ] Открыл бота - нет ошибок в консоли
- [ ] Профиль загружается без ошибок

## 🎉 Готово!

Если все пункты выполнены - приложение должно работать!

Для дополнительной проверки используйте:
- `node test-api.js https://ваш-backend-url.railway.app`
- Страница `/test` в приложении
- Руководство `TESTING_GUIDE.md`
