# Kraina Mriy Backend API

Backend API для системи навчання персоналу ресторанної мережі "Країна Мрій".

## Технології

- **NestJS** - фреймворк
- **TypeScript** - мова програмування
- **MongoDB** - база даних
- **Mongoose** - ODM
- **JWT** - аутентифікація
- **Winston** - логування

## Встановлення

```bash
# Встановити залежності
npm install

# Копіювати .env.example в .env та налаштувати
cp .env.example .env

# Запустити в режимі розробки
npm run start:dev

# Запустити в продакшн режимі
npm run build
npm run start:prod
```

## Структура проекту

```
src/
├── auth/              # Аутентифікація
├── users/             # Користувачі
├── questions/         # Питання
├── tests/             # Тести
├── knowledge-base/    # База знань
├── ratings/           # Рейтинги
├── surveys/           # Опитування
├── achievements/      # Ачівки
├── shop/              # Магазин
├── admin/             # Адмін API
├── push/              # Push-повідомлення
├── files/             # Файли
├── cron/              # Cron jobs
└── common/            # Спільні модулі
```

## API Endpoints

Базовий URL: `http://localhost:3000/api/v1`

### Аутентифікація
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід
- `POST /auth/admin/login` - Вхід адміна
- `GET /auth/profile` - Профіль
- `POST /auth/refresh` - Оновлення токену
- `POST /auth/logout` - Вихід

## Розробка

```bash
# Запустити тести
npm run test

# Запустити тести з покриттям
npm run test:cov

# Лінтер
npm run lint

# Форматування
npm run format
```

## Ліцензія

Private

