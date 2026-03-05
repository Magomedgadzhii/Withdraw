# 🚀 Быстрый старт

## Установка и запуск

```bash
# 1. Установить зависимости
npm install

# 2. Запустить в режиме разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🎯 Тестовые данные

Для успешного withdrawal введите:
- **Amount:** любое число > 0 (например: `100`)
- **Destination:** любой адрес (например: `0x123abc`)
- **Confirm:** поставьте галочку ✓

Подробнее см. [TESTING.md](./TESTING.md)

## Тестирование

```bash
# Unit тесты
npm test

# E2E тесты (требуется запущенный dev server в другом терминале)
npm run test:e2e
```

## Что реализовано

✅ Next.js 14 App Router + TypeScript  
✅ Zustand state management  
✅ Zod валидация  
✅ Защита от двойного submit  
✅ Retry с exponential backoff  
✅ Idempotency keys  
✅ Восстановление после reload (5 мин)  
✅ 6 unit тестов + 2 E2E теста  
✅ Mock API с MSW  

## Архитектура

- `/app` - Next.js страницы
- `/components` - React компоненты
- `/lib` - Бизнес-логика (API, store, utils)
- `/mocks` - MSW handlers
- `/__tests__` - Unit тесты
- `/e2e` - E2E тесты

Подробнее см. [README.md](./README.md)
