# Полный деплой YakGo на Vercel

Пошаговая инструкция по развертыванию **всего проекта** (Frontend + Backend + Database) на Vercel.

## ⚠️ Важное о Vercel

**Что работает отлично:**
- ✅ Next.js Frontend (основная специализация Vercel)
- ✅ Serverless API функции (RESTful API)
- ✅ Автоматический SSL
- ✅ Глобальный CDN
- ✅ Автоматические деплои из GitHub

**Ограничения для Backend:**
- ❌ **WebSocket НЕ поддерживается** (Vercel = serverless, нет долгих соединений)
- ⏱️ Таймаут функций: 10 секунд (Hobby), 60 секунд (Pro)
- 📦 Каждая функция запускается отдельно (cold start ~1-2 секунды)

**Что это означает для YakGo:**
- ✅ REST API полностью работает
- ✅ Telegram уведомления работают
- ✅ Все CRUD операции работают
- ❌ **Real-time чат через WebSocket НЕ РАБОТАЕТ** (нужна альтернатива)
- ❌ **Real-time отслеживание водителя НЕ РАБОТАЕТ** (нужна альтернатива)

## 🎯 Архитектура на Vercel

```
┌─────────────────────────┐
│   Telegram Mini App     │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ↓                ↓
┌─────────┐    ┌──────────────┐
│Frontend │    │Backend (API) │
│Next.js  │    │Serverless Fn │
│Vercel   │    │Vercel        │
└─────────┘    └──────┬───────┘
                      │
              ┌───────┴────────┐
              ↓                ↓
        ┌──────────┐    ┌─────────────┐
        │PostgreSQL│    │Telegram Bot │
        │Supabase  │    │   API       │
        └──────────┘    └─────────────┘
```

---

## Шаг 1: Подготовка Backend для Vercel

### 1.1 Создайте конфигурацию Vercel

В корне проекта создайте файл `vercel.json`:

```bash
cd ~/studio
```

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 1.2 Адаптируйте Backend под Serverless

Создайте файл `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### 1.3 Обновите package.json для Vercel

В `backend/package.json` добавьте скрипты:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "vercel-build": "prisma generate && tsc"
  }
}
```

### 1.4 Измените index.ts для serverless

⚠️ **Важно:** WebSocket не будет работать на Vercel. Нужно отключить Socket.IO.

Откройте `backend/src/index.ts` и закомментируйте WebSocket код:

```typescript
// backend/src/index.ts

import express from 'express';
import cors from 'cors';
// import { Server } from 'socket.io'; // ❌ Закомментируйте
// import http from 'http'; // ❌ Закомментируйте

const app = express();

// ❌ Закомментируйте создание HTTP сервера
// const server = http.createServer(app);

// ❌ Закомментируйте Socket.IO
// const io = new Server(server, {
//   cors: { origin: process.env.FRONTEND_URL }
// });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
// ... остальные routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Для Vercel экспортируйте app, а не запускайте сервер
export default app;

// ❌ Закомментируйте запуск сервера
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
```

**Альтернатива для real-time функций:**
- Используйте **polling** (запросы каждые 5-10 секунд)
- Или подключите **Pusher** / **Ably** для WebSocket (платные сервисы)

---

## Шаг 2: База данных PostgreSQL (Supabase)

### 2.1 Создайте проект в Supabase

1. Перейдите на https://supabase.com/
2. **Sign in with GitHub**
3. **New project**

**Настройки:**
- **Name:** `yakgo-db`
- **Database Password:** Создайте надежный пароль
- **Region:** `Southeast Asia (Singapore)`
- **Pricing Plan:** `Free` (500 MB)

4. Нажмите **Create new project** (2-3 минуты)

### 2.2 Получите строку подключения

1. **Settings** → **Database**
2. **Connection string** → **URI**
3. Скопируйте строку:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

### 2.3 Примените миграции

На локальной машине:

```bash
cd ~/studio/backend

# Создайте .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
EOF

# Установите зависимости
npm install

# Примените миграции
npm run prisma:push

# Заполните тестовыми данными (опционально)
npm run prisma:seed
```

---

## Шаг 3: Деплой Backend на Vercel

### 3.1 Зарегистрируйтесь на Vercel

1. Перейдите на https://vercel.com/
2. **Sign up** → **Continue with GitHub**

### 3.2 Импортируйте проект

1. **Add New...** → **Project**
2. Найдите репозиторий `studio`
3. **Import**

### 3.3 Настройте Backend проект

**Важно:** Vercel должен задеплоить **только backend**, а не весь репозиторий.

**Настройки:**
- **Project Name:** `yakgo-backend`
- **Framework Preset:** `Other`
- **Root Directory:** `backend` ⚠️ **ВАЖНО!**
- **Build Command:** `npm run vercel-build`
- **Output Directory:** (оставьте пустым)
- **Install Command:** `npm install`

### 3.4 Переменные окружения для Backend

В разделе **Environment Variables** добавьте:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres

# Server
NODE_ENV=production

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=ваш_супер_секретный_ключ_минимум_32_символа

# Telegram Bot
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
TELEGRAM_BOT_SECRET=ваш_секрет

# Frontend URL (обновите после деплоя frontend)
FRONTEND_URL=https://temp-url.vercel.app

# ЮKassa
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
```

**Как сгенерировать JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.5 Деплой Backend

1. Нажмите **Deploy**
2. Vercel соберет и задеплоит backend (3-5 минут)
3. После завершения получите URL: `https://yakgo-backend.vercel.app`

### 3.6 Проверьте работу Backend

Откройте в браузере:
```
https://yakgo-backend.vercel.app/health
```

Должны увидеть: `{"status":"ok"}`

---

## Шаг 4: Деплой Frontend на Vercel

### 4.1 Создайте новый проект для Frontend

1. **Add New...** → **Project**
2. Снова выберите репозиторий `studio`
3. **Import**

### 4.2 Настройте Frontend проект

**Настройки:**
- **Project Name:** `yakgo` (или `yakgo-app`)
- **Framework Preset:** `Next.js` (автоматически)
- **Root Directory:** `./ ` (корень, не backend!)
- **Build Command:** `npm run build` (автоматически)
- **Output Directory:** `.next` (автоматически)
- **Install Command:** `npm install`

### 4.3 Переменные окружения для Frontend

```env
# Backend API (ваш URL с предыдущего шага)
NEXT_PUBLIC_API_URL=https://yakgo-backend.vercel.app/api
NEXT_PUBLIC_WS_URL=https://yakgo-backend.vercel.app

# 2GIS API Key
NEXT_PUBLIC_2GIS_API_KEY=ваш_ключ_2gis

# AI (опционально)
OLLAMA_ENABLED=false
```

**Как получить 2GIS API Key:**
1. https://dev.2gis.ru/
2. Зарегистрируйтесь и создайте проект

### 4.4 Деплой Frontend

1. Нажмите **Deploy**
2. Vercel соберет Next.js (3-5 минут)
3. Получите URL: `https://yakgo.vercel.app`

### 4.5 Обновите FRONTEND_URL в Backend

1. Вернитесь в проект **yakgo-backend**
2. **Settings** → **Environment Variables**
3. Измените `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://yakgo.vercel.app
   ```
4. **Redeploy** backend (Vercel автоматически предложит)

---

## Шаг 5: Настройка Telegram Bot

### 5.1 Создайте бота через BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/newbot`
3. **Имя:** `YakGo`
4. **Username:** `YakGoBot` (уникальный)
5. **Сохраните токен**

### 5.2 Настройте Mini App

```
/newapp
# Выберите вашего бота
# Название: YakGo
# Описание: Помощь на дорогах Якутии
# Фото: загрузите (640x640px)
# Short name: yakgo
# Web App URL: https://yakgo.vercel.app
```

### 5.3 Обновите токен в Backend

1. **yakgo-backend** → **Settings** → **Environment Variables**
2. Измените `TELEGRAM_BOT_TOKEN` на реальный токен
3. **Redeploy**

---

## Шаг 6: Решение проблемы с WebSocket (Real-time функции)

### Вариант 1: Polling (Рекомендуется для Vercel)

Вместо WebSocket используйте периодические запросы:

**Для чата:**
```typescript
// Frontend: опрашивайте API каждые 5 секунд
useEffect(() => {
  const interval = setInterval(async () => {
    const messages = await fetch(`/api/chat/${orderId}/messages`);
    // Обновите UI
  }, 5000); // каждые 5 секунд

  return () => clearInterval(interval);
}, [orderId]);
```

**Для отслеживания водителя:**
```typescript
// Обновляйте позицию каждые 10 секунд
useEffect(() => {
  const interval = setInterval(async () => {
    const location = await fetch(`/api/orders/${orderId}/driver-location`);
    // Обновите карту
  }, 10000);

  return () => clearInterval(interval);
}, [orderId]);
```

**Создайте новый endpoint в backend:**

```typescript
// backend/src/controllers/orders.controller.ts

export async function getDriverLocation(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      driverLocation: true,
      updatedAt: true
    }
  });

  res.json({ location: order?.driverLocation, timestamp: order?.updatedAt });
}

// Добавьте в routes:
// GET /api/orders/:id/driver-location
```

### Вариант 2: Pusher (Платный, но работает на Vercel)

1. Зарегистрируйтесь на https://pusher.com/
2. Создайте app (бесплатно до 200k сообщений/день)
3. Получите credentials
4. Установите библиотеки:

```bash
# Backend
npm install pusher

# Frontend
npm install pusher-js
```

**Backend:**
```typescript
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER
});

// Отправка сообщения
await pusher.trigger(`chat-${orderId}`, 'new-message', { message });
```

**Frontend:**
```typescript
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: 'eu'
});

const channel = pusher.subscribe(`chat-${orderId}`);
channel.bind('new-message', (data) => {
  // Обновить UI
});
```

### Вариант 3: Supabase Realtime (Бесплатно)

Supabase предоставляет real-time функции:

```typescript
// Frontend
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Подписка на изменения в таблице Message
supabase
  .channel('messages')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'Message' },
    (payload) => {
      // Новое сообщение
      console.log(payload.new);
    }
  )
  .subscribe();
```

---

## Шаг 7: Автоматические обновления

### 7.1 Настройте Git Integration

Vercel автоматически настраивает CI/CD:

```bash
# Любой push в main → автоматический деплой
git add .
git commit -m "Update feature"
git push origin main

# Vercel автоматически:
# 1. Обнаружит изменения
# 2. Запустит build
# 3. Задеплоит на production
```

### 7.2 Preview Deployments

Каждая ветка создает preview URL:

```bash
git checkout -b feature/new-chat
git push origin feature/new-chat

# Vercel создаст:
# https://yakgo-git-feature-new-chat-username.vercel.app
```

---

## Шаг 8: Кастомный домен (опционально)

### 8.1 Добавьте домен в Vercel

**Для Frontend:**
1. **yakgo** project → **Settings** → **Domains**
2. Добавьте: `app.yourdomain.com`
3. Настройте DNS:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**Для Backend:**
1. **yakgo-backend** project → **Settings** → **Domains**
2. Добавьте: `api.yourdomain.com`
3. Настройте DNS:

```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600
```

4. Vercel автоматически выпустит SSL сертификаты

### 8.2 Обновите переменные окружения

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
```

**Backend:**
```env
FRONTEND_URL=https://app.yourdomain.com
```

---

## Мониторинг и логи

### Vercel Dashboard

1. **Deployments** → выберите деплой
2. **Function Logs** - логи serverless функций
3. **Build Logs** - логи сборки

### Supabase

1. **Database** → **Logs**
2. **Database** → **Reports** (использование)

### Real-time мониторинг

Настройте Vercel Analytics:

1. **Project Settings** → **Analytics**
2. **Enable Analytics** (бесплатно на Hobby)

---

## Ограничения и оптимизация

### Лимиты Vercel Free (Hobby)

| Ресурс | Лимит |
|--------|-------|
| Bandwidth | 100 GB/месяц |
| Serverless Function Execution | 100 GB-Hrs/месяц |
| Deployments | 100/день |
| Функции timeout | 10 секунд |

### Оптимизация для serverless

**1. Минимизируйте cold starts:**
```typescript
// Переместите импорты внутрь функций, если они тяжелые
export async function handler(req, res) {
  const prisma = (await import('@prisma/client')).PrismaClient;
  // ...
}
```

**2. Кэшируйте результаты:**
```typescript
// Используйте Vercel Edge Config для кэширования
import { get } from '@vercel/edge-config';

const cachedData = await get('key');
```

**3. Используйте Edge Functions для статики:**
```typescript
// vercel.json
{
  "functions": {
    "api/users": {
      "runtime": "edge"
    }
  }
}
```

---

## Troubleshooting

### Backend не отвечает

**Проблема:** 500 Internal Server Error

**Решение:**
1. Проверьте Function Logs в Vercel
2. Убедитесь, что все Environment Variables установлены
3. Проверьте, что Prisma Client сгенерирован (`npm run vercel-build`)

### WebSocket ошибки

**Проблема:** WebSocket connection failed

**Решение:**
- WebSocket не поддерживается на Vercel
- Используйте polling или Pusher (см. Шаг 6)

### Database connection timeout

**Проблема:** Не удается подключиться к БД

**Решение:**
1. Проверьте `DATABASE_URL` в Vercel Environment Variables
2. Убедитесь, что Supabase база активна (не на паузе)
3. Проверьте, что в строке подключения `?sslmode=require`

### Cold start медленный

**Проблема:** Первый запрос после простоя медленный

**Решение:**
- Это нормально для serverless (1-2 секунды)
- Upgrade до Vercel Pro для faster cold starts
- Или используйте uptime мониторинг (пингует каждые 5 минут)

---

## Стоимость

### Бесплатный план (Hobby)

```
Frontend Vercel:  $0
Backend Vercel:   $0
Supabase Free:    $0
─────────────────────
ИТОГО:            $0/месяц
```

**Ограничения:**
- 100 GB bandwidth
- 10 секунд timeout функций
- Нет WebSocket
- Cold starts

### Vercel Pro ($20/мес)

```
Vercel Pro:       $20/мес
Supabase Pro:     $25/мес (опционально)
─────────────────────
ИТОГО:            $20-45/месяц
```

**Преимущества:**
- 1 TB bandwidth
- 60 секунд timeout
- Faster cold starts
- Team collaboration

---

## Чек-лист развертывания

- [ ] ✅ База данных создана в Supabase
- [ ] ✅ Миграции применены
- [ ] ✅ Backend адаптирован (WebSocket отключен)
- [ ] ✅ Backend задеплоен на Vercel
- [ ] ✅ Frontend задеплоен на Vercel
- [ ] ✅ Переменные окружения настроены везде
- [ ] ✅ FRONTEND_URL обновлен в backend
- [ ] ✅ Telegram Bot создан
- [ ] ✅ Mini App настроен
- [ ] ✅ Health check работает
- [ ] ✅ Регистрация работает
- [ ] ✅ API endpoints отвечают
- [ ] ✅ Уведомления приходят в Telegram
- [ ] ⚠️ Real-time функции заменены на polling

---

## Альтернатива: Hybrid подход

Если нужен обязательно WebSocket:

**Вариант 1:**
- Frontend → Vercel
- Backend REST API → Vercel
- **WebSocket сервер → Render.com** (бесплатно)
- Database → Supabase

**Вариант 2:**
- Frontend → Vercel
- Backend полностью → Railway ($5/месяц)
- Database → Railway (включено)

---

## Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Dashboard](https://app.supabase.com/)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Pusher](https://pusher.com/)

---

## Поддержка

При возникновении проблем:

1. **Проверьте логи:**
   - Vercel → Deployments → Function Logs
   - Supabase → Database → Logs

2. **Проверьте переменные окружения:**
   - Все ли переменные добавлены?
   - Правильные ли значения?

3. **Создайте issue:**
   - https://github.com/Fakesuka/studio/issues

**Успешного деплоя на Vercel! 🚀**
