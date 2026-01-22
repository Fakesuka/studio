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

## WebSocket Events

### От клиента:
- `driver:location` - Водитель отправляет координаты
- `order:subscribe` - Подписка на обновления заказа
- `order:unsubscribe` - Отписка от обновлений

### От сервера:
- `driver:location:update` - Обновление координат водителя

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
