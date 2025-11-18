# Kraina Mriy Frontend (Admin Panel)

Адмін-панель для системи навчання персоналу ресторанної мережі "Країна Мрій".

## Технології

- **React 18** - UI бібліотека
- **TypeScript** - мова програмування
- **Vite** - збірщик
- **Material-UI** - UI компоненти
- **React Router** - маршрутизація
- **React Query** - управління станом сервера
- **React Hook Form** - форми
- **Axios** - HTTP клієнт

## Встановлення

```bash
# Встановити залежності
npm install

# Запустити в режимі розробки
npm run dev

# Зібрати для продакшну
npm run build

# Переглянути збірку
npm run preview
```

## Структура проекту

```
src/
├── components/        # Переіспользувані компоненти
│   └── Layout/       # Layout компоненти
├── pages/            # Сторінки
│   ├── auth/         # Авторизація
│   ├── dashboard/    # Дашборд
│   ├── questions/    # Питання
│   ├── knowledge-base/# База знань
│   ├── users/        # Користувачі
│   ├── statistics/   # Статистика
│   ├── surveys/      # Опитування
│   ├── achievements/ # Ачівки
│   ├── shop/         # Магазин
│   └── settings/     # Налаштування
├── services/         # API сервіси
├── hooks/            # Custom hooks
├── theme.ts          # Тема Material-UI
└── App.tsx           # Головний компонент
```

## Розробка

```bash
# Лінтер
npm run lint

# Форматування
npm run format
```

## Ліцензія

Private

