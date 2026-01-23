# Деплой YakGo в Яндекс.Облако

Подробная инструкция по развертыванию полного стека YakGo (Frontend + Backend + Database) в Яндекс.Облаке.

## Содержание

1. [Архитектура в Яндекс.Облаке](#архитектура)
2. [Предварительные требования](#предварительные-требования)
3. [Шаг 1: Создание базы данных PostgreSQL](#шаг-1-создание-базы-данных)
4. [Шаг 2: Деплой Backend (Compute Cloud)](#шаг-2-деплой-backend)
5. [Шаг 3: Деплой Frontend (Vercel/Compute Cloud)](#шаг-3-деплой-frontend)
6. [Шаг 4: Настройка доменов и SSL](#шаг-4-настройка-доменов)
7. [Шаг 5: Настройка Telegram Bot](#шаг-5-настройка-telegram-bot)
8. [Мониторинг и логи](#мониторинг)
9. [Обновление приложения](#обновление)

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│              Telegram Mini App (Client)             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
          ┌────────────┴────────────┐
          ↓                         ↓
┌──────────────────┐      ┌──────────────────┐
│   Frontend       │      │   Backend API    │
│   (Vercel или    │      │   (Compute Cloud)│
│   Compute Cloud) │      │   + WebSocket    │
└──────────────────┘      └─────────┬────────┘
                                    │
                          ┌─────────┴──────────┐
                          ↓                    ↓
                ┌──────────────────┐  ┌────────────────┐
                │   PostgreSQL     │  │  Telegram Bot  │
                │ (Managed Service)│  │      API       │
                └──────────────────┘  └────────────────┘
```

---

## Предварительные требования

### 1. Аккаунт Яндекс.Облако

1. Зарегистрируйтесь на https://cloud.yandex.ru/
2. Создайте организацию и каталог (folder)
3. Привяжите банковскую карту (пробный период 60 дней бесплатно, 4000₽ на баланс)

### 2. Установите CLI инструменты

```bash
# Установка Yandex Cloud CLI
curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Перезапустите терминал и проверьте
yc --version

# Инициализация CLI
yc init
# Выберите каталог (folder) для работы
```

### 3. Установите дополнительные инструменты

```bash
# Docker (для сборки образов)
# macOS:
brew install docker docker-compose

# Linux:
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Node.js 18+ (если еще не установлен)
node --version  # Должно быть >= 18
```

---

## Шаг 1: Создание базы данных

### Вариант A: Managed Service for PostgreSQL (Рекомендуется)

#### 1.1 Создание кластера через консоль

1. Откройте консоль Яндекс.Облака: https://console.cloud.yandex.ru/
2. Перейдите в **Managed Service for PostgreSQL**
3. Нажмите **Создать кластер**

**Настройки кластера:**
- **Имя:** `yakgo-db`
- **Окружение:** `PRODUCTION`
- **Версия:** `PostgreSQL 14`
- **Класс хоста:** `s2.micro` (2 vCPU, 8 GB RAM) для старта
- **Размер хранилища:** 20 GB (SSD)
- **Сеть:** Создайте новую или выберите существующую
- **Публичный доступ:** ✅ Включите (для разработки)

**Пользователь и БД:**
- **Имя БД:** `yakgo`
- **Имя пользователя:** `yakgo_user`
- **Пароль:** Сгенерируйте надежный пароль

4. Нажмите **Создать кластер** (создание займет 5-10 минут)

#### 1.2 Создание кластера через CLI

```bash
# Создание кластера
yc managed-postgresql cluster create \
  --name yakgo-db \
  --environment production \
  --network-name default \
  --postgresql-version 14 \
  --resource-preset s2.micro \
  --disk-type network-ssd \
  --disk-size 20 \
  --user name=yakgo_user,password=YOUR_STRONG_PASSWORD \
  --database name=yakgo,owner=yakgo_user \
  --host zone-id=ru-central1-a,subnet-name=default-ru-central1-a,assign-public-ip=true

# Получите хост базы данных
yc managed-postgresql cluster list-hosts yakgo-db
```

#### 1.3 Получите строку подключения

После создания кластера получите строку подключения:

```bash
# Формат строки подключения:
DATABASE_URL="postgresql://yakgo_user:YOUR_PASSWORD@c-XXXXXX.rw.mdb.yandexcloud.net:6432/yakgo?sslmode=require"
```

**Где найти хост:**
1. В консоли откройте кластер `yakgo-db`
2. Вкладка **Хосты** → скопируйте FQDN хоста
3. Порт обычно `6432`

#### 1.4 Применение миграций

```bash
# Склонируйте репозиторий на локальную машину
git clone https://github.com/Fakesuka/studio.git
cd studio/backend

# Установите зависимости
npm install

# Создайте .env файл
cat > .env << EOF
DATABASE_URL="postgresql://yakgo_user:YOUR_PASSWORD@c-XXXXXX.rw.mdb.yandexcloud.net:6432/yakgo?sslmode=require"
EOF

# Примените миграции
npm run prisma:push

# Заполните тестовыми данными (опционально)
npm run prisma:seed
```

---

## Шаг 2: Деплой Backend

### Вариант A: Compute Cloud VM (Виртуальная машина)

#### 2.1 Создание виртуальной машины

```bash
# Создайте VM через CLI
yc compute instance create \
  --name yakgo-backend \
  --zone ru-central1-a \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=20 \
  --memory 2GB \
  --cores 2 \
  --core-fraction 100 \
  --ssh-key ~/.ssh/id_rsa.pub

# Сохраните публичный IP адрес
yc compute instance get yakgo-backend | grep -A 5 one_to_one_nat
```

**Или через консоль:**
1. Compute Cloud → Виртуальные машины → Создать ВМ
2. **Имя:** `yakgo-backend`
3. **Зона:** `ru-central1-a`
4. **Образ:** Ubuntu 22.04 LTS
5. **Диск:** 20 GB SSD
6. **Память:** 2 GB RAM, 2 vCPU
7. **Публичный IP:** Включите
8. **SSH ключ:** Добавьте свой публичный ключ

#### 2.2 Подключитесь к VM

```bash
# Получите IP адрес
export VM_IP=$(yc compute instance get yakgo-backend --format json | jq -r '.network_interfaces[0].primary_v4_address.one_to_one_nat.address')

# Подключитесь по SSH
ssh ubuntu@$VM_IP
```

#### 2.3 Установите зависимости на VM

```bash
# Обновите систему
sudo apt-get update && sudo apt-get upgrade -y

# Установите Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2 (менеджер процессов)
sudo npm install -g pm2

# Установите Git
sudo apt-get install -y git

# Проверьте версии
node --version  # v18.x
npm --version   # 9.x
pm2 --version
```

#### 2.4 Клонируйте и настройте Backend

```bash
# Клонируйте репозиторий
cd ~
git clone https://github.com/Fakesuka/studio.git
cd studio/backend

# Установите зависимости
npm install

# Соберите TypeScript
npm run build

# Создайте .env файл
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://yakgo_user:YOUR_PASSWORD@c-XXXXXX.rw.mdb.yandexcloud.net:6432/yakgo?sslmode=require"

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY_CHANGE_THIS"

# Telegram Bot
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_BOT_SECRET="your_bot_secret"

# Frontend URL (обновите после деплоя frontend)
FRONTEND_URL="https://your-frontend-domain.vercel.app"

# ЮKassa
YOOKASSA_SHOP_ID="your_shop_id"
YOOKASSA_SECRET_KEY="your_secret_key"
EOF

# Замените значения в .env на реальные
nano .env  # или vim .env

# Примените миграции
npm run prisma:push
```

#### 2.5 Запустите Backend с PM2

```bash
# Запустите приложение
pm2 start dist/index.js --name yakgo-backend

# Настройте автозапуск
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs yakgo-backend

# Откройте порт в firewall (если нужно)
sudo ufw allow 3001/tcp
```

#### 2.6 Настройка Nginx (reverse proxy + SSL)

```bash
# Установите Nginx
sudo apt-get install -y nginx

# Создайте конфигурацию
sudo nano /etc/nginx/sites-available/yakgo-backend

# Вставьте конфигурацию:
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Замените на ваш домен

    # Увеличиваем таймауты для WebSocket
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Стандартные заголовки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активируйте конфигурацию
sudo ln -s /etc/nginx/sites-available/yakgo-backend /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx

# Включите автозапуск
sudo systemctl enable nginx
```

#### 2.7 Установка SSL с Certbot (Let's Encrypt)

```bash
# Установите Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Получите SSL сертификат (замените на ваш домен)
sudo certbot --nginx -d api.yourdomain.com

# Certbot автоматически обновит конфигурацию Nginx
# Выберите опцию "2" для редиректа HTTP → HTTPS

# Проверьте автообновление сертификата
sudo certbot renew --dry-run
```

Теперь Backend доступен по адресу: `https://api.yourdomain.com`

---

## Шаг 3: Деплой Frontend

### Вариант A: Vercel (Рекомендуется для Next.js)

#### 3.1 Подготовка репозитория

```bash
# Убедитесь, что все изменения запушены
cd ~/studio
git add .
git commit -m "Deploy configuration"
git push origin main
```

#### 3.2 Деплой на Vercel

1. Откройте https://vercel.com/ и войдите через GitHub
2. Нажмите **New Project**
3. Импортируйте репозиторий `studio`
4. **Framework:** Vercel автоматически определит Next.js
5. **Root Directory:** Оставьте пустым (корень проекта)
6. **Build Command:** `npm run build` (автоматически)
7. **Output Directory:** `.next` (автоматически)

#### 3.3 Настройка переменных окружения

В настройках проекта на Vercel добавьте:

```env
# API Backend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com

# 2GIS Maps
NEXT_PUBLIC_2GIS_API_KEY=your_2gis_api_key

# AI (Qwen) - опционально
OLLAMA_ENABLED=false
# DASHSCOPE_API_KEY=sk-xxx
# OPENAI_API_KEY=sk-xxx
```

8. Нажмите **Deploy**

После деплоя Vercel предоставит URL типа: `https://studio-abc123.vercel.app`

#### 3.4 Настройка кастомного домена (опционально)

1. В настройках проекта → **Domains**
2. Добавьте ваш домен: `app.yourdomain.com`
3. Настройте DNS записи у регистратора:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

### Вариант B: Compute Cloud VM

Если хотите разместить Frontend тоже в Яндекс.Облаке:

```bash
# На той же VM или создайте новую
cd ~/studio

# Установите зависимости
npm install

# Создайте .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NEXT_PUBLIC_2GIS_API_KEY=your_key
EOF

# Соберите продакшн версию
npm run build

# Запустите с PM2
pm2 start npm --name yakgo-frontend -- start

# Настройте Nginx для Frontend
sudo nano /etc/nginx/sites-available/yakgo-frontend
```

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/yakgo-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d app.yourdomain.com
```

---

## Шаг 4: Настройка доменов

### 4.1 DNS записи

У вашего регистратора доменов (например, reg.ru, timeweb.com) создайте записи:

```
# Backend API
Type: A
Name: api
Value: <IP адрес VM с Backend>
TTL: 3600

# Frontend (если на своей VM)
Type: A
Name: app
Value: <IP адрес VM с Frontend>
TTL: 3600

# Или для Vercel Frontend:
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

### 4.2 Обновите FRONTEND_URL в Backend

```bash
# На VM с Backend
ssh ubuntu@$VM_IP
cd ~/studio/backend
nano .env

# Измените FRONTEND_URL на:
FRONTEND_URL=https://app.yourdomain.com

# Или если используете Vercel:
FRONTEND_URL=https://studio-abc123.vercel.app

# Перезапустите Backend
pm2 restart yakgo-backend
```

---

## Шаг 5: Настройка Telegram Bot

### 5.1 Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Укажите имя: `YakGo`
4. Укажите username: `YakGoBot` (должен быть свободен)
5. Сохраните токен из ответа

### 5.2 Настройка Mini App

```bash
# Отправьте BotFather команду:
/setmenubutton

# Выберите вашего бота
# Введите название кнопки: Открыть YakGo
# Введите URL: https://app.yourdomain.com

# Настройте описание
/setdescription
# Введите описание сервиса

# Настройте изображение (512x512 PNG)
/setuserpic
# Загрузите логотип
```

### 5.3 Настройка Web App

```bash
# Откройте чат с BotFather
/myapps

# Выберите вашего бота
# New Web App → введите URL: https://app.yourdomain.com
# Short Name: yakgo
```

### 5.4 Webhook для платежей (ЮKassa)

```bash
# В личном кабинете ЮKassa настройте webhook:
URL: https://api.yourdomain.com/api/payments/webhook/yookassa
Метод: POST

# События:
✅ payment.succeeded
✅ payment.canceled
✅ payout.succeeded
✅ payout.canceled
```

---

## Мониторинг

### Логи Backend

```bash
# Просмотр логов PM2
pm2 logs yakgo-backend

# Последние 100 строк
pm2 logs yakgo-backend --lines 100

# Только ошибки
pm2 logs yakgo-backend --err

# Мониторинг в реальном времени
pm2 monit
```

### Логи Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Мониторинг базы данных

1. Откройте консоль Яндекс.Облака
2. Managed Service for PostgreSQL → yakgo-db
3. **Мониторинг** - графики CPU, RAM, IOPS, connections

### Настройка алертов

```bash
# Установите Telegram уведомления от PM2
npm install -g pm2-telegram

# Настройте
pm2 install pm2-telegram
pm2 set pm2-telegram:token <BOT_TOKEN>
pm2 set pm2-telegram:chat_id <YOUR_CHAT_ID>
```

---

## Обновление приложения

### Backend

```bash
# Подключитесь к VM
ssh ubuntu@$VM_IP

# Перейдите в директорию
cd ~/studio/backend

# Получите обновления
git pull origin main

# Установите новые зависимости (если есть)
npm install

# Пересоберите
npm run build

# Примените миграции БД
npm run prisma:push

# Перезапустите приложение
pm2 restart yakgo-backend

# Проверьте логи
pm2 logs yakgo-backend --lines 50
```

### Frontend (Vercel)

Vercel автоматически деплоит при push в GitHub:

```bash
cd ~/studio
git add .
git commit -m "Update frontend"
git push origin main

# Vercel автоматически запустит деплой
# Отслеживайте прогресс на https://vercel.com/dashboard
```

### Frontend (Compute Cloud)

```bash
ssh ubuntu@$VM_IP
cd ~/studio

git pull origin main
npm install
npm run build

pm2 restart yakgo-frontend
```

---

## Резервное копирование

### База данных

```bash
# Автоматическое резервное копирование включено в Managed PostgreSQL
# Настройте в консоли:
# 1. Откройте кластер yakgo-db
# 2. Настройки → Резервные копии
# 3. Время начала: 03:00
# 4. Хранить: 7 дней

# Ручное создание backup
yc managed-postgresql cluster backup yakgo-db

# Восстановление из backup
yc managed-postgresql cluster restore \
  --backup-id <backup_id> \
  --name yakgo-db-restored
```

### Файлы приложения

```bash
# Создайте snapshot диска VM
yc compute snapshot create \
  --disk-name yakgo-backend-disk \
  --name yakgo-backend-snapshot-$(date +%Y%m%d)

# Автоматизируйте через cron
crontab -e

# Добавьте (каждую ночь в 2:00):
0 2 * * * yc compute snapshot create --disk-name yakgo-backend-disk --name yakgo-backend-snapshot-$(date +\%Y\%m\%d)
```

---

## Масштабирование

### Вертикальное (больше ресурсов)

```bash
# Увеличьте ресурсы VM
yc compute instance update yakgo-backend \
  --memory 4GB \
  --cores 4

# Или через консоль: ВМ → Изменить
```

### Горизонтальное (больше инстансов)

```bash
# Создайте Load Balancer
yc load-balancer network-load-balancer create \
  --name yakgo-lb \
  --region-id ru-central1 \
  --target-group target-group-id=...,subnet-id=...

# Или используйте Application Load Balancer для WebSocket
```

---

## Стоимость (примерная)

**Минимальная конфигурация:**
- **Compute Cloud VM** (2 vCPU, 2GB RAM): ~1500₽/месяц
- **PostgreSQL** (s2.micro): ~3000₽/месяц
- **Трафик** (100 GB): ~150₽/месяц
- **Диски** (40 GB SSD): ~400₽/месяц

**Итого:** ~5000₽/месяц (~$55/месяц)

**Frontend на Vercel:** Бесплатно (hobby tier)

---

## Troubleshooting

### Backend не запускается

```bash
# Проверьте логи
pm2 logs yakgo-backend --err

# Проверьте порт
sudo netstat -tulpn | grep 3001

# Проверьте переменные окружения
cd ~/studio/backend && cat .env

# Проверьте подключение к БД
npm run prisma:studio  # Откроет GUI на порту 5555
```

### WebSocket не работает

```bash
# Проверьте конфигурацию Nginx
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/yakgo-backend

# Убедитесь, что есть строки:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";
```

### База данных недоступна

```bash
# Проверьте статус кластера
yc managed-postgresql cluster get yakgo-db

# Проверьте хосты
yc managed-postgresql cluster list-hosts yakgo-db

# Проверьте подключение
psql "postgresql://yakgo_user:PASSWORD@c-XXX.rw.mdb.yandexcloud.net:6432/yakgo?sslmode=require"
```

---

## Полезные ссылки

- [Документация Yandex Cloud](https://cloud.yandex.ru/docs)
- [Managed PostgreSQL](https://cloud.yandex.ru/docs/managed-postgresql/)
- [Compute Cloud](https://cloud.yandex.ru/docs/compute/)
- [SSL сертификаты](https://cloud.yandex.ru/docs/certificate-manager/)
- [Мониторинг](https://cloud.yandex.ru/docs/monitoring/)

---

## Поддержка

Если возникли вопросы:
1. Проверьте логи: `pm2 logs yakgo-backend`
2. Проверьте документацию Yandex Cloud
3. Создайте issue в репозитории: https://github.com/Fakesuka/studio/issues

**Успешного деплоя! 🚀**
