#!/bin/bash

# Быстрый тест YakGo с вашими реальными URL

BACKEND_URL="https://gregarious-laughter-production.up.railway.app"
FRONTEND_URL="https://studio-black-sigma.vercel.app"

echo "======================================================================"
echo "🧪 Быстрый тест YakGo"
echo "======================================================================"
echo ""
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend Health
echo "📊 Тест 1: Backend Health Check"
echo "URL: $BACKEND_URL/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
HEALTH_JSON=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Backend отвечает (HTTP $HTTP_CODE)"
    echo "Response:"
    echo "$HEALTH_JSON" | jq . 2>/dev/null || echo "$HEALTH_JSON"
else
    echo "❌ Backend не отвечает или ошибка (HTTP $HTTP_CODE)"
    echo "Response:"
    echo "$HEALTH_JSON"
fi
echo ""

# Test 2: Detailed Health
echo "📊 Тест 2: Detailed Health Check"
echo "URL: $BACKEND_URL/health/detailed"
echo ""

DETAILED_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/health/detailed" 2>&1)
HTTP_CODE_DETAILED=$(echo "$DETAILED_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
DETAILED_JSON=$(echo "$DETAILED_RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE_DETAILED" == "200" ]; then
    echo "✅ Detailed health отвечает (HTTP $HTTP_CODE_DETAILED)"
    echo "Response:"
    echo "$DETAILED_JSON" | jq . 2>/dev/null || echo "$DETAILED_JSON"
else
    echo "❌ Detailed health не отвечает (HTTP $HTTP_CODE_DETAILED)"
fi
echo ""

# Test 3: Frontend check
echo "📊 Тест 3: Frontend доступность"
echo "URL: $FRONTEND_URL"
echo ""

FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1)

if [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo "✅ Frontend доступен (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend недоступен (HTTP $FRONTEND_RESPONSE)"
fi
echo ""

# Summary
echo "======================================================================"
echo "📋 Резюме"
echo "======================================================================"

if [ "$HTTP_CODE" == "200" ] && [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo "✅ Backend работает"
    echo "✅ Frontend работает"
    echo ""
    echo "🎯 Следующие шаги:"
    echo "1. Откройте https://studio-black-sigma.vercel.app/test"
    echo "2. Нажмите 'Test Backend Health'"
    echo "3. Проверьте что success: true"
    echo ""
    echo "📖 Полное руководство: см. DEPLOYMENT_CHECK.md"
else
    echo "⚠️  Обнаружены проблемы:"
    [ "$HTTP_CODE" != "200" ] && echo "  - Backend не отвечает на /health"
    [ "$FRONTEND_RESPONSE" != "200" ] && echo "  - Frontend недоступен"
    echo ""
    echo "📖 См. DEPLOYMENT_CHECK.md для решения проблем"
fi
echo ""
