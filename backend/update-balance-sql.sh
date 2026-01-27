#!/bin/bash

# Подключаемся к БД и обновляем баланс пользователя pllotnikvv

export PGPASSWORD=password

echo "🔍 Поиск пользователя pllotnikvv..."

# Поиск пользователя
RESULT=$(psql -h localhost -U user -d yakgo -t -c "SELECT id, name, \"telegramId\", balance FROM \"User\" WHERE name ILIKE '%pllotnikvv%' OR \"telegramId\" ILIKE '%pllotnikvv%' LIMIT 1;")

if [ -z "$RESULT" ]; then
    echo "❌ Пользователь pllotnikvv не найден"
    echo ""
    echo "📋 Список всех пользователей:"
    psql -h localhost -U user -d yakgo -c "SELECT id, name, \"telegramId\", balance FROM \"User\" LIMIT 20;"
    exit 1
fi

echo "✅ Найден пользователь:"
echo "$RESULT"

# Получаем ID пользователя
USER_ID=$(echo "$RESULT" | awk '{print $1}' | tr -d ' ')

echo ""
echo "💰 Добавление 10000 рублей к балансу..."

# Обновляем баланс
psql -h localhost -U user -d yakgo -c "UPDATE \"User\" SET balance = balance + 10000 WHERE id = '$USER_ID';"

# Создаем запись о транзакции
psql -h localhost -U user -d yakgo -c "INSERT INTO \"Transaction\" (id, \"userId\", type, amount, description, \"createdAt\") VALUES (gen_random_uuid(), '$USER_ID', 'topup', 10000, 'Пополнение баланса администратором', NOW());"

echo ""
echo "✅ Баланс успешно обновлен!"
echo ""
echo "📊 Новый баланс:"
psql -h localhost -U user -d yakgo -c "SELECT id, name, \"telegramId\", balance FROM \"User\" WHERE id = '$USER_ID';"
