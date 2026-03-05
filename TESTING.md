# 🧪 Инструкция по тестированию

## Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## ✅ Тестовые данные для успешного withdrawal

### Вариант 1 (минимальный):
- **Amount:** `1`
- **Destination:** `0x123`
- **Confirm:** ✓ (поставить галочку)

### Вариант 2 (реалистичный):
- **Amount:** `100.50`
- **Destination:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- **Confirm:** ✓

### Вариант 3 (большая сумма):
- **Amount:** `5000`
- **Destination:** `TXyz123abc456def789`
- **Confirm:** ✓

## 🎯 Что проверить

### 1. Валидация формы
- ❌ Amount = 0 → показывает ошибку
- ❌ Amount = пусто → кнопка disabled
- ❌ Destination = пусто → кнопка disabled
- ❌ Confirm не отмечен → кнопка disabled
- ✅ Все поля заполнены корректно → кнопка активна

### 2. Успешный submit
1. Заполните форму валидными данными
2. Нажмите "Submit Withdrawal"
3. Должно появиться:
   - ✅ "Withdrawal request submitted successfully!"
   - Transaction ID
   - Сумма и адрес
   - Статус: Pending
   - Дата создания

### 3. Защита от двойного submit
1. Заполните форму
2. Быстро нажмите "Submit Withdrawal" несколько раз
3. Кнопка должна стать disabled после первого клика
4. Должна быть создана только одна транзакция

### 4. Восстановление после reload
1. Заполните форму и отправьте
2. Обновите страницу (F5)
3. Нажмите "Make Another Withdrawal"
4. Попробуйте отправить еще раз
5. Должна появиться ошибка о дубликате (если в течение 5 минут)

### 5. Обработка ошибок
Для тестирования ошибок нужно модифицировать API route или использовать DevTools:
- Network tab → Throttling → Offline (для проверки retry)

## 🔍 Проверка в DevTools

### Console
Не должно быть ошибок (warnings от React в dev mode - это нормально)

### Network tab
1. Откройте Network tab
2. Отправьте форму
3. Должен быть запрос:
   - `POST /api/v1/withdrawals`
   - Status: 201
   - Headers: `Idempotency-Key`
   - Response: JSON с данными withdrawal

### Application → Session Storage
После отправки должны появиться:
- `lastIdempotencyKey`
- `lastIdempotencyKeyTime`

## 🧪 Автоматические тесты

```bash
# Unit тесты (6 тестов)
npm test

# E2E тесты (2 теста)
npm run test:e2e
```

## ❓ Troubleshooting

### "Failed to create withdrawal"
1. Проверьте, что dev server запущен (`npm run dev`)
2. Откройте DevTools → Console для деталей ошибки
3. Проверьте Network tab - должен быть запрос к `/api/v1/withdrawals`

### Кнопка всегда disabled
1. Проверьте, что все поля заполнены
2. Amount должен быть > 0
3. Destination не должен быть пустым
4. Checkbox должен быть отмечен

### Ничего не происходит после submit
1. Откройте DevTools → Console
2. Проверьте Network tab
3. Убедитесь, что нет блокировки CORS
