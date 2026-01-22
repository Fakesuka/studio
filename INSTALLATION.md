# 📦 Установка и развертывание YakGo

Полное руководство по установке и запуску приложения YakGo (фронтенд + бэкенд + Telegram бот).

## Требования

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** или **yarn**
- **Telegram аккаунт** для создания бота

---

## 🚀 Быстрый старт (Локальная разработка)

### 1. Установка PostgreSQL

#### macOS (Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
Скачайте и установите с https://www.postgresql.org/download/windows/

### 2. Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql postgres

# В psql создайте базу данных
CREATE DATABASE yakgo;
CREATE USER yakgo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE yakgo TO yakgo_user;
\q
```

---

## 🔧 Настройка Backend

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `backend`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Database
DATABASE_URL="postgresql://yakgo_user:your_secure_password@localhost:5432/yakgo"

# Server
PORT=3001
NODE_ENV=development

# JWT (создайте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Telegram Bot (получите токен от @BotFather)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_SECRET=your-telegram-bot-secret

# CORS
FRONTEND_URL=http://localhost:9002

# 2GIS API (опционально, для расчета расстояний)
TWOGIS_API_KEY=ca41037...
```

### 3. Создание Telegram бота

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Следуйте инструкциям (введите имя и username)
4. Скопируйте токен бота и вставьте в `TELEGRAM_BOT_TOKEN`
5. **ВАЖНО**: Сохраните токен в безопасном месте!

### 4. Инициализация базы данных

```bash
# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:push

# Заполнение тестовыми данными (магазины и товары)
npm run prisma:seed
```

### 5. Запуск Backend сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:3001`

Проверьте работу: `curl http://localhost:3001/health`

---

## 🎨 Настройка Frontend

### 1. Установка зависимостей

```bash
cd ..  # вернитесь в корневую папку
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001

# 2GIS API
NEXT_PUBLIC_2GIS_API_KEY=ca41037...
```

### 3. Запуск Frontend

```bash
npm run dev
```

Приложение запустится на `http://localhost:9002`

---

## 🤖 Настройка Telegram Mini App

### 1. Запуск инструкции для бота

```bash
cd backend
npm run bot
```

Вы увидите инструкцию по настройке. Следуйте шагам:

### 2. Настройка кнопки Menu Button

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **Bot Settings** > **Menu Button**
5. Выберите **Edit Menu Button URL**
6. Введите URL: `http://localhost:9002` (для локальной разработки)
7. Введите текст кнопки: `Открыть YakGo`

### 3. Тестирование

1. Найдите вашего бота в Telegram
2. Нажмите кнопку меню внизу (рядом с полем ввода)
3. Приложение откроется внутри Telegram!

---

## 🌐 Развертывание в Production

### Требования для production:

- **HTTPS** обязателен для Telegram Mini Apps
- Публичный домен
- SSL сертификат

### 1. Развертывание Frontend

#### Vercel (рекомендуется):

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel

# Настройте переменные окружения в Vercel Dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.com/api
# NEXT_PUBLIC_WS_URL = https://your-backend.com
# NEXT_PUBLIC_2GIS_API_KEY = your-key
```

#### Другие платформы:
- Netlify
- Railway
- Digital Ocean App Platform

### 2. Развертывание Backend

#### Railway (рекомендуется):

```bash
# 1. Создайте аккаунт на railway.app
# 2. Создайте новый проект
# 3. Добавьте PostgreSQL database
# 4. Деплойте из GitHub или локально

# Настройте переменные окружения в Railway:
DATABASE_URL=<автоматически генерируется>
PORT=3001
NODE_ENV=production
JWT_SECRET=<случайная строка>
TELEGRAM_BOT_TOKEN=<ваш токен>
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Другие платформы:
- Heroku
- Digital Ocean
- AWS (EC2 + RDS)
- Google Cloud Platform

### 3. Обновление Mini App URL

После развертывания:

1. Перейдите в @BotFather
2. `/mybots` > ваш бот > **Bot Settings** > **Menu Button**
3. Обновите URL на production URL: `https://your-app.vercel.app`

---

## 🧪 Проверка работы

### Backend API:

```bash
# Health check
curl https://your-backend.com/health

# Проверка с Telegram initData (требуется реальный initData из Mini App)
curl -H "X-Telegram-Init-Data: query_id=..." \
     https://your-backend.com/api/users/profile
```

### Frontend:

1. Откройте https://your-app.vercel.app в браузере
2. Для Telegram - откройте бота и нажмите кнопку меню

### WebSocket:

```javascript
// В консоли браузера
const socket = io('https://your-backend.com');
socket.on('connect', () => console.log('Connected!'));
```

---

## 📊 Полезные команды

### Backend:

```bash
# Разработка
npm run dev           # Запуск в режиме разработки
npm run build         # Сборка TypeScript
npm run start         # Запуск production сервера
npm run bot           # Инструкции для Telegram бота

# Prisma
npm run prisma:studio      # GUI для базы данных
npm run prisma:generate    # Генерация Prisma Client
npm run prisma:migrate     # Создание и применение миграций
npm run prisma:seed        # Заполнение тестовыми данными
```

### Frontend:

```bash
npm run dev           # Запуск в режиме разработки
npm run build         # Сборка для production
npm run start         # Запуск production сборки
npm run lint          # Проверка кода
```

---

## 🔍 Troubleshooting

### Ошибка подключения к БД

```
Error: Can't reach database server
```

**Решение:**
- Проверьте, что PostgreSQL запущен
- Проверьте `DATABASE_URL` в `.env`
- Проверьте права пользователя БД

### CORS ошибки

```
Access to fetch at 'http://localhost:3001/api/...' has been blocked by CORS
```

**Решение:**
- Проверьте `FRONTEND_URL` в backend `.env`
- Убедитесь, что фронтенд запущен на указанном URL

### Telegram validation failed

```
Error: Invalid authorization data
```

**Решение:**
- Проверьте `TELEGRAM_BOT_TOKEN` в `.env`
- Убедитесь, что приложение открыто через Telegram Mini App, а не напрямую в браузере

### WebSocket не подключается

**Решение:**
- Проверьте `NEXT_PUBLIC_WS_URL` в frontend `.env.local`
- Убедитесь, что backend сервер запущен
- В production используйте `wss://` вместо `ws://`

---

## 📚 Дополнительные ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Socket.IO Docs](https://socket.io/docs/)

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи backend: `cd backend && npm run dev`
2. Проверьте консоль браузера (F12)
3. Проверьте переменные окружения в `.env` файлах
4. Создайте issue в GitHub репозитории

---

## 🎉 Готово!

Теперь у вас запущено полноценное приложение YakGo:

✅ Backend API с аутентификацией через Telegram  
✅ Frontend с Telegram Mini App интеграцией  
✅ WebSocket для отслеживания в реальном времени  
✅ База данных PostgreSQL с Prisma ORM  
✅ Telegram бот для запуска приложения  

Удачи в разработке! 🚀
