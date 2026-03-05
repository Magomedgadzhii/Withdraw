# Withdraw App - USDT Withdrawal Interface

Тестовое задание для Frontend Developer (React + Next.js). Реализация страницы вывода средств с акцентом на устойчивость, безопасность и архитектуру.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

**Mock API работает автоматически** через Next.js API Routes (`/app/api/v1/withdrawals`).

### Запуск тестов

```bash
# Unit и интеграционные тесты
npm test

# E2E тесты (требуется запущенный dev server)
npm run test:e2e
```

### Сборка для продакшена

```bash
npm run build
npm start
```

## 📋 Реализованные требования

### Core функциональность

✅ **Страница Withdraw**
- Поля: amount (> 0), destination, confirm (checkbox)
- Submit доступен только при валидной форме
- Submit disabled во время запроса

✅ **API интеграция**
- POST /v1/withdrawals с idempotency_key
- GET /v1/withdrawals/{id}
- Обработка 409 Conflict с понятным сообщением
- Retry при сетевых ошибках (exponential backoff)
- Сохранение данных формы при ошибках

✅ **Устойчивость UI**
- Защита от двойного submit через флаг isSubmitting
- Состояния: idle/loading/success/error
- Отображение статуса заявки после успеха

✅ **Архитектура и безопасность**
- Next.js 14 App Router + TypeScript
- Zustand для state management
- Zod для type-safe валидации
- Безопасный рендеринг (без dangerouslySetInnerHTML)
- Mock auth (см. раздел "Безопасность")

✅ **Тесты**
- Happy-path submit
- Обработка ошибок API
- Защита от двойного submit
- Валидация формы
- Retry логика
- E2E тесты с Playwright

### Optional функциональность

✅ **Восстановление после reload**
- Idempotency key сохраняется в sessionStorage
- Валиден в течение 5 минут
- Автоматически очищается после успешной транзакции

✅ **Оптимизации производительности**
- useMemo для валидации формы
- useCallback для обработчиков
- Минимизация ре-рендеров

✅ **E2E тесты**
- Полный флоу withdrawal
- Валидация формы

## 🏗️ Архитектура

### Структура проекта

```
/app
  /withdraw
    page.tsx              # Главная страница withdrawal
  layout.tsx              # Root layout
  globals.css             # Глобальные стили
  
/components
  /withdraw
    WithdrawForm.tsx      # Форма вывода средств
    WithdrawStatus.tsx    # Отображение статуса заявки
    
/lib
  /api
    withdrawals.ts        # API клиент с retry логикой
  /store
    withdrawStore.ts      # Zustand store
  /types
    withdrawal.ts         # TypeScript типы и Zod схемы
  /utils
    idempotency.ts        # Генерация и хранение idempotency keys
    
/mocks
  handlers.ts             # MSW request handlers
  server.ts               # MSW server для тестов
  browser.ts              # MSW worker для браузера
  
/__tests__
  withdraw.test.tsx       # Unit и интеграционные тесты
  
/e2e
  withdraw.spec.ts        # E2E тесты
```

### Ключевые технические решения

#### 1. State Management (Zustand)

Выбран Zustand за:
- Минимальный boilerplate
- TypeScript-first подход
- Отсутствие Provider hell
- Простота тестирования

Store содержит:
- UI состояние (idle/loading/success/error)
- Данные withdrawal
- Флаг isSubmitting для защиты от двойного submit
- Actions для submit и reset

#### 2. Валидация (Zod)

- Type-safe валидация на уровне типов
- Единый источник истины для типов и runtime валидации
- Понятные сообщения об ошибках
- Валидация в реальном времени с useMemo

#### 3. API клиент

**Idempotency:**
- Генерация уникального ключа: `withdraw_${timestamp}_${random}`
- Хранение в sessionStorage для восстановления
- Автоматическая очистка после успеха

**Retry логика:**
- Exponential backoff (1s, 2s, 4s)
- Не повторяет 4xx ошибки (кроме 409)
- Сохраняет данные формы между попытками

**Обработка ошибок:**
- Кастомный класс WithdrawalAPIError
- Специальная обработка 409 Conflict
- Понятные сообщения для пользователя

#### 4. Защита от двойного submit

Многоуровневая защита:
1. Флаг `isSubmitting` в store
2. Проверка в начале submitWithdrawal
3. Disabled кнопка во время загрузки
4. Idempotency key на уровне API

#### 5. Mock API (MSW)

- Реалистичная имитация API
- Работает в тестах и браузере
- Симуляция задержек и ошибок
- In-memory хранение для idempotency

## 🔒 Безопасность

### Authentication подход

**Текущая реализация (mock):**
- Без реальной аутентификации
- API endpoints открыты

**Production подход:**

1. **HTTP-only cookies для токенов**
   ```typescript
   // Next.js API route
   export async function POST(request: Request) {
     const token = cookies().get('auth_token')
     
     const response = await fetch(API_URL, {
       headers: {
         'Authorization': `Bearer ${token}`,
       }
     })
   }
   ```

2. **Server-side API calls**
   - Все API запросы через Next.js API routes
   - Токены никогда не попадают в браузер
   - CSRF защита через SameSite cookies

3. **Session management**
   - Короткий lifetime для access tokens (15 мин)
   - Refresh tokens в HTTP-only cookies
   - Автоматическое обновление через middleware

4. **Security headers**
   ```javascript
   // next.config.js
   headers: [
     {
       key: 'X-Frame-Options',
       value: 'DENY'
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff'
     },
     {
       key: 'Strict-Transport-Security',
       value: 'max-age=31536000'
     }
   ]
   ```

### XSS защита

- Все пользовательские данные рендерятся через React (автоматический escaping)
- Нет использования dangerouslySetInnerHTML
- Content Security Policy в production

### CSRF защита

- SameSite cookies
- CSRF токены для state-changing операций
- Origin/Referer проверки

## 🧪 Тестирование

### Unit тесты (Vitest + React Testing Library)

6 тестов покрывают:
- ✅ Happy-path submit
- ✅ API ошибки
- ✅ Защита от двойного submit
- ✅ 409 Conflict обработка
- ✅ Валидация формы
- ✅ Retry логика

### E2E тесты (Playwright)

2 теста покрывают:
- ✅ Полный флоу withdrawal
- ✅ Валидация формы

### Запуск тестов

```bash
# Все unit тесты
npm test

# Watch mode
npm test -- --watch

# С UI
npm run test:ui

# E2E тесты
npm run test:e2e

# E2E в UI mode
npx playwright test --ui
```

## 🎯 Оптимизации производительности

1. **Мемоизация валидации**
   - useMemo для validation результата
   - Пересчет только при изменении полей

2. **Callback мемоизация**
   - useCallback для event handlers
   - Предотвращение лишних ре-рендеров

3. **Оптимизация форм**
   - Controlled inputs с debounce валидации
   - Валидация только touched полей

4. **Bundle optimization**
   - Next.js автоматический code splitting
   - Tree shaking для неиспользуемого кода

## 📝 Возможные улучшения

Если бы было больше времени:

1. **UX улучшения**
   - Анимации переходов между состояниями
   - Toast notifications
   - История транзакций
   - Копирование transaction ID

2. **Функциональность**
   - Отмена pending withdrawal
   - Множественные валюты
   - Адресная книга для destination
   - QR код для адресов

3. **Тестирование**
   - Больше edge cases
   - Visual regression тесты
   - Performance тесты
   - Accessibility audit

4. **Мониторинг**
   - Error tracking (Sentry)
   - Analytics (успешность транзакций)
   - Performance monitoring

## 🛠️ Технологии

- **Next.js 14** - React framework с App Router
- **TypeScript** - Type safety
- **Zustand** - State management
- **Zod** - Schema validation
- **MSW** - API mocking
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## 📄 Лицензия

MIT

---

**Время разработки:** ~3 часа  
**Автор:** [Ваше имя]  
**Дата:** 2026
