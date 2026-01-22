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

## Подробная документация

См. [INSTALLATION.md](../INSTALLATION.md) в корне проекта.
