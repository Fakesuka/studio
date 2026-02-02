# Интеграция ЮMoney (через ЮKassa)

В проекте уже подготовлена интеграция платежей через ЮKassa, включая вывод средств на кошелек ЮMoney.
Этот документ описывает, какие данные нужно добавить для запуска.

## 1. Создайте аккаунт ЮKassa
1. Зарегистрируйтесь в ЮKassa: https://yookassa.ru/
2. Подключите магазин и получите:
   - `YOOKASSA_SHOP_ID`
   - `YOOKASSA_SECRET_KEY`

## 2. Включите выплаты на ЮMoney
1. В кабинете ЮKassa включите выплаты.
2. Разрешите вывод средств на ЮMoney (кошелек).

## 3. Добавьте переменные окружения

### Backend (.env)
```
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
```

## 4. Настройте webhook
В ЮKassa настройте вебхук на:
```
POST https://<ваш-домен>/api/payments/webhook/yookassa
```

ЮKassa не использует подпись — для безопасности настройте IP whitelist в кабинете.

## 5. Проверка в приложении
1. Пополнение баланса:
   - Клиент инициирует платеж (backend: `POST /api/payments/create`).
2. Вывод средств (ЮMoney):
   - В профиле водителя выберите способ вывода **ЮMoney**.
   - Укажите номер кошелька.

## 6. Где в коде это реализовано
- Backend интеграция ЮKassa: `backend/src/utils/yookassa.ts`
- Контроллер платежей: `backend/src/controllers/payments.controller.ts`
- Роуты: `backend/src/routes/payments.routes.ts`
- Вывод средств на ЮMoney: `createPayout(...)` в `backend/src/utils/yookassa.ts`

После подстановки ключей и настройки вебхука платежи и вывод будут работать без дополнительных изменений в коде.
