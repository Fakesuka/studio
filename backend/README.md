# YakGo Backend API

Backend API для приложения YakGo - платформы для автовладельцев в Якутии.

## Технологии

- **Node.js** + **TypeScript**
- **Express** - веб-сервер
- **Prisma** - ORM для работы с PostgreSQL
- **Socket.IO** - WebSocket для real-time функций
- **Telegram Mini App** - аутентификация

## Быстрый старт

```bash
# 1. Установите зависимости
npm install

# 2. Настройте .env файл
cp .env.example .env
# Отредактируйте .env (см. ниже)

# 3. Инициализируйте базу данных
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# 4. Запустите сервер
npm run dev
```

## Переменные окружения (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yakgo"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_BOT_SECRET=your-secret
FRONTEND_URL=http://localhost:9002
```

## API Endpoints

### Пользователи
- `GET /api/users/profile` - Получить профиль
- `PUT /api/users/profile` - Обновить профиль
- `GET /api/users/balance` - Получить баланс
- `POST /api/users/register-driver` - Регистрация водителя
- `POST /api/users/register-seller` - Регистрация продавца

### Заказы услуг
- `POST /api/orders` - Создать заказ
- `GET /api/orders/my-orders` - Мои заказы
- `GET /api/orders/available` - Доступные заказы (для водителей)
- `GET /api/orders/driver-orders` - Заказы водителя
- `POST /api/orders/:id/accept` - Принять заказ
- `POST /api/orders/:id/complete` - Завершить заказ
- `POST /api/orders/:id/cancel` - Отменить заказ

### Маркетплейс
- `GET /api/marketplace/shops` - Список магазинов
- `GET /api/marketplace/shops/:id` - Магазин по ID
- `GET /api/marketplace/products` - Список товаров
- `POST /api/marketplace/products` - Добавить товар (продавец)
- `PUT /api/marketplace/products/:id` - Обновить товар
- `DELETE /api/marketplace/products/:id` - Удалить товар

### Корзина
- `GET /api/marketplace/cart` - Получить корзину
- `POST /api/marketplace/cart` - Добавить в корзину
- `PUT /api/marketplace/cart/:productId` - Обновить количество
- `DELETE /api/marketplace/cart/:productId` - Удалить из корзины

### Заказы маркетплейса
- `POST /api/marketplace/orders` - Оформить заказ
- `GET /api/marketplace/orders` - Мои заказы
- `GET /api/marketplace/seller/orders` - Заказы продавца

### Админ-панель
- `GET /api/admin/dashboard/stats` - Статистика для дашборда
- `GET /api/admin/users` - Список всех пользователей
- `POST /api/admin/users/:id/make-admin` - Назначить администратором
- `POST /api/admin/users/:id/remove-admin` - Снять права администратора
- `GET /api/admin/drivers/pending` - Неверифицированные водители
- `POST /api/admin/drivers/:id/verify` - Верифицировать водителя
- `POST /api/admin/drivers/:id/unverify` - Снять верификацию
- `GET /api/admin/sellers/pending` - Неверифицированные продавцы
- `POST /api/admin/sellers/:id/verify` - Верифицировать продавца
- `POST /api/admin/sellers/:id/unverify` - Снять верификацию
- `GET /api/admin/products/pending` - Неодобренные товары
- `POST /api/admin/products/:id/approve` - Одобрить товар
- `POST /api/admin/products/:id/unapprove` - Отклонить товар
- `GET /api/admin/orders` - Все заказы (services + marketplace)

### Платежи (ЮKassa)
- `POST /api/payments/create` - Создать платеж для пополнения баланса
- `GET /api/payments/:paymentId/status` - Проверить статус платежа
- `GET /api/payments/transactions` - История транзакций
- `POST /api/payments/withdraw` - Запрос на вывод средств (водители/продавцы)
- `POST /api/payments/webhook/yookassa` - Webhook для обработки платежей

### Отзывы и рейтинги
- `POST /api/reviews` - Создать отзыв после заказа
- `GET /api/reviews/user/:userId` - Получить отзывы о пользователе
- `GET /api/reviews/my-reviews` - Мои отзывы
- `GET /api/reviews/can-review/:orderId` - Проверить возможность оставить отзыв

### Чат
- `GET /api/chat/conversations` - Список всех чатов пользователя
- `GET /api/chat/unread-count` - Количество непрочитанных сообщений
- `GET /api/chat/:orderId/messages` - История сообщений по заказу
- `POST /api/chat/:orderId/send` - Отправить сообщение

### Аналитика
- `GET /api/analytics/driver` - Статистика для водителя (period: day/week/month/year)
- `GET /api/analytics/seller` - Статистика для продавца (продажи, топ товары)
- `GET /api/analytics/top-drivers` - Рейтинг лучших водителей

### Бонусы и промокоды
- `POST /api/bonuses/apply-promocode` - Применить промокод
- `POST /api/bonuses/confirm-promocode-usage` - Подтвердить использование
- `GET /api/bonuses/referral-link` - Получить реферальную ссылку
- `POST /api/bonuses/register-referral` - Зарегистрировать реферала
- `POST /api/bonuses/promocodes` - Создать промокод (admin)
- `GET /api/bonuses/promocodes` - Список промокодов (admin)

## WebSocket Events

### Отслеживание водителя:
**От клиента:**
- `driver:location` - Водитель отправляет координаты
- `order:subscribe` - Подписка на обновления заказа
- `order:unsubscribe` - Отписка от обновлений

**От сервера:**
- `driver:location:update` - Обновление координат водителя

### Чат:
**От клиента:**
- `chat:join` - Присоединиться к чату заказа
- `chat:leave` - Покинуть чат
- `chat:send` - Отправить сообщение
- `chat:mark-read` - Отметить сообщения как прочитанные

**От сервера:**
- `chat:message` - Новое сообщение в чате
- `chat:messages-read` - Сообщения прочитаны
- `chat:error` - Ошибка отправки сообщения

## Аутентификация

Все запросы требуют заголовок:
```
X-Telegram-Init-Data: <initData from Telegram.WebApp>
```

## Команды

```bash
npm run dev              # Режим разработки
npm run build            # Сборка
npm run start            # Production
npm run bot              # Инструкции для Telegram бота
npm run prisma:studio    # GUI для БД
npm run prisma:seed      # Тестовые данные
```

## Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma      # Схема БД
│   └── seed.ts            # Тестовые данные
├── src/
│   ├── controllers/       # Контроллеры
│   ├── middleware/        # Middleware (auth)
│   ├── routes/            # Маршруты
│   ├── utils/             # Утилиты
│   ├── index.ts           # Главный файл сервера
│   └── bot.ts             # Telegram бот
├── .env                   # Переменные окружения
└── package.json
```

## Модели базы данных

### Новые модели (v2.0.0):

**Message** - Сообщения чата между клиентом и водителем:
```prisma
model Message {
  id         String   @id @default(cuid())
  orderId    String   // ID заказа
  senderId   String   // Отправитель
  receiverId String   // Получатель
  content    String   // Текст сообщения
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

**Promocode** - Промокоды для скидок и бонусов:
```prisma
model Promocode {
  id        String    @id @default(cuid())
  code      String    @unique
  type      String    // discount_percent, discount_fixed, bonus_balance
  value     Float     // Значение (процент или сумма)
  maxUses   Int?      // Максимум использований
  usedCount Int       @default(0)
  expiresAt DateTime? // Срок действия
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
}
```

**PromocodeUsage** - История использования промокодов:
```prisma
model PromocodeUsage {
  id             String   @id @default(cuid())
  userId         String
  promocodeId    String
  orderId        String?
  discountAmount Float
  createdAt      DateTime @default(now())
}
```

**Referral** - Реферальная программа:
```prisma
model Referral {
  id          String   @id @default(cuid())
  referrerId  String   // Кто пригласил
  referredId  String   @unique // Кого пригласили
  bonusGiven  Boolean  @default(false)
  bonusAmount Float    @default(0)
  createdAt   DateTime @default(now())
}
```

## Детальная документация API

### Чат (Chat API)

#### GET /api/chat/conversations
Получить список всех чатов пользователя с последним сообщением.

**Ответ:**
```json
{
  "conversations": [
    {
      "orderId": "order123",
      "otherUser": {
        "id": "user456",
        "name": "Иван Иванов",
        "avatar": "https://..."
      },
      "lastMessage": {
        "content": "Спасибо!",
        "createdAt": "2026-01-22T10:30:00Z",
        "read": true
      },
      "unreadCount": 0
    }
  ]
}
```

#### GET /api/chat/:orderId/messages
Получить историю сообщений по заказу. Автоматически помечает сообщения как прочитанные.

**Ответ:**
```json
{
  "messages": [
    {
      "id": "msg123",
      "senderId": "user123",
      "receiverId": "user456",
      "content": "Здравствуйте, я уже еду",
      "read": true,
      "createdAt": "2026-01-22T10:00:00Z"
    }
  ]
}
```

#### POST /api/chat/:orderId/send
Отправить сообщение в чат.

**Запрос:**
```json
{
  "content": "Привет! Когда будете?"
}
```

**Ответ:**
```json
{
  "message": {
    "id": "msg456",
    "orderId": "order123",
    "senderId": "user123",
    "receiverId": "driver789",
    "content": "Привет! Когда будете?",
    "read": false,
    "createdAt": "2026-01-22T10:35:00Z"
  }
}
```

### Аналитика (Analytics API)

#### GET /api/analytics/driver?period=month
Получить статистику для водителя за период.

**Параметры:**
- `period`: `day`, `week`, `month`, `year`

**Ответ:**
```json
{
  "summary": {
    "totalRevenue": 50000,
    "earnings": 45000,
    "ordersCount": 25,
    "avgOrderValue": 2000
  },
  "serviceBreakdown": [
    {
      "service": "Отогрев авто",
      "count": 15,
      "revenue": 30000
    },
    {
      "service": "Доставка топлива",
      "count": 10,
      "revenue": 20000
    }
  ],
  "dailyStats": [
    {
      "date": "2026-01-15",
      "revenue": 4000,
      "ordersCount": 2
    }
  ]
}
```

#### GET /api/analytics/seller?period=month
Получить статистику для продавца.

**Ответ:**
```json
{
  "summary": {
    "totalSales": 100000,
    "ordersCount": 50,
    "avgOrderValue": 2000,
    "productsCount": 25
  },
  "topProducts": [
    {
      "id": "prod123",
      "name": "Моторное масло 5W-40",
      "sales": 30000,
      "quantity": 15
    }
  ]
}
```

#### GET /api/analytics/top-drivers
Публичный рейтинг лучших водителей.

**Ответ:**
```json
{
  "drivers": [
    {
      "id": "driver123",
      "name": "Иван Иванов",
      "totalOrders": 150,
      "totalEarnings": 300000,
      "averageRating": 4.8
    }
  ]
}
```

### Бонусы (Bonuses API)

#### POST /api/bonuses/apply-promocode
Применить промокод к заказу.

**Запрос:**
```json
{
  "code": "WINTER2026",
  "orderAmount": 1000
}
```

**Ответ (успешно):**
```json
{
  "valid": true,
  "promocode": {
    "code": "WINTER2026",
    "type": "discount_percent",
    "value": 15
  },
  "discountAmount": 150,
  "finalAmount": 850
}
```

**Ответ (ошибка):**
```json
{
  "valid": false,
  "error": "Промокод уже использован"
}
```

#### POST /api/bonuses/confirm-promocode-usage
Подтвердить использование промокода после создания заказа.

**Запрос:**
```json
{
  "code": "WINTER2026",
  "orderId": "order123",
  "discountAmount": 150
}
```

#### GET /api/bonuses/referral-link
Получить реферальную ссылку пользователя.

**Ответ:**
```json
{
  "referralLink": "https://t.me/YakGoBot?start=ref_user123",
  "referralCode": "user123"
}
```

#### POST /api/bonuses/register-referral
Зарегистрировать реферала (вызывается при регистрации нового пользователя).

**Запрос:**
```json
{
  "referralCode": "user123"
}
```

**Ответ:**
```json
{
  "success": true,
  "referrerBonus": 100,
  "referredBonus": 50
}
```

#### POST /api/bonuses/promocodes (Admin)
Создать новый промокод.

**Запрос:**
```json
{
  "code": "NEWYEAR2026",
  "type": "discount_percent",
  "value": 20,
  "maxUses": 100,
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

#### GET /api/bonuses/promocodes (Admin)
Получить список всех промокодов.

**Ответ:**
```json
{
  "promocodes": [
    {
      "id": "promo123",
      "code": "NEWYEAR2026",
      "type": "discount_percent",
      "value": 20,
      "usedCount": 45,
      "maxUses": 100,
      "expiresAt": "2026-12-31T23:59:59Z",
      "active": true
    }
  ]
}
```

## Система уведомлений

Backend автоматически отправляет push-уведомления через Telegram Bot API при следующих событиях:

- **Новый заказ** → Водителю (с деталями и кнопкой "Принять")
- **Заказ принят** → Клиенту (водитель в пути)
- **Заказ завершен** → Обеим сторонам
- **Новое сообщение в чате** → Получателю (с текстом сообщения)
- **Пополнение баланса** → Пользователю (сумма и новый баланс)
- **Вывод средств обработан** → Водителю/продавцу
- **Новый отзыв** → Водителю/продавцу
- **Бонус по реферальной программе** → Обеим сторонам
- **Применен промокод** → Пользователю

Все уведомления отправляются через утилиту `src/utils/telegram-notifications.ts`.

## Настройка Telegram Bot для уведомлений

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и сохраните в `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
3. Пользователи должны запустить бота (`/start`)
4. При запуске бот сохранит `telegramId` в БД
5. После этого бот сможет отправлять уведомления

## Подробная документация

См. [INSTALLATION.md](../INSTALLATION.md) в корне проекта.
