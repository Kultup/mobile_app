# Структура проекту

## Backend (NestJS)

```
backend/
├── src/
│   ├── auth/                    # Аутентифікація
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── users/                   # Користувачі
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── schemas/
│   │       └── user.schema.ts
│   ├── questions/               # Питання
│   │   ├── questions.controller.ts
│   │   ├── questions.service.ts
│   │   ├── questions.module.ts
│   │   └── schemas/
│   │       ├── question.schema.ts
│   │       └── question-category.schema.ts
│   ├── tests/                   # Тести
│   │   ├── tests.controller.ts
│   │   ├── tests.service.ts
│   │   ├── tests.module.ts
│   │   └── schemas/
│   │       └── user-test.schema.ts
│   ├── knowledge-base/          # База знань
│   │   ├── knowledge-base.controller.ts
│   │   ├── knowledge-base.service.ts
│   │   └── knowledge-base.module.ts
│   ├── ratings/                 # Рейтинги
│   │   ├── ratings.controller.ts
│   │   ├── ratings.service.ts
│   │   └── ratings.module.ts
│   ├── surveys/                 # Опитування
│   │   ├── surveys.controller.ts
│   │   ├── surveys.service.ts
│   │   └── surveys.module.ts
│   ├── achievements/            # Ачівки
│   │   ├── achievements.controller.ts
│   │   ├── achievements.service.ts
│   │   └── achievements.module.ts
│   ├── shop/                    # Магазин
│   │   ├── shop.controller.ts
│   │   ├── shop.service.ts
│   │   └── shop.module.ts
│   ├── admin/                   # Адмін API
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   └── schemas/
│   │       └── admin-user.schema.ts
│   ├── push/                    # Push-повідомлення
│   │   ├── push.controller.ts
│   │   ├── push.service.ts
│   │   └── push.module.ts
│   ├── files/                   # Файли
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── files.module.ts
│   ├── cron/                    # Cron jobs
│   │   ├── cron.service.ts
│   │   └── cron.module.ts
│   ├── common/                  # Спільні модулі
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── response.dto.ts
│   │   ├── schemas/
│   │   │   ├── city.schema.ts
│   │   │   └── position.schema.ts
│   │   ├── logger/
│   │   │   ├── logger.module.ts
│   │   │   └── winston.logger.ts
│   │   ├── constants/
│   │   │   └── roles.ts
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts
│   │   └── utils/
│   │       └── helpers.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                        # Тести
├── logs/                        # Логи
├── uploads/                     # Завантажені файли
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## Frontend (React + TypeScript)

```
frontend/
├── src/
│   ├── components/              # Переіспользувані компоненти
│   │   └── Layout/
│   │       ├── Layout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── pages/                   # Сторінки
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── questions/
│   │   │   ├── QuestionsPage.tsx
│   │   │   └── QuestionFormPage.tsx
│   │   ├── knowledge-base/
│   │   │   └── KnowledgeBasePage.tsx
│   │   ├── users/
│   │   │   └── UsersPage.tsx
│   │   ├── statistics/
│   │   │   └── StatisticsPage.tsx
│   │   ├── surveys/
│   │   │   └── SurveysPage.tsx
│   │   ├── achievements/
│   │   │   └── AchievementsPage.tsx
│   │   ├── shop/
│   │   │   └── ShopPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   ├── services/                # API сервіси
│   │   ├── api.ts
│   │   └── auth.service.ts
│   ├── hooks/                   # Custom hooks
│   │   └── useAuth.ts
│   ├── types/                   # TypeScript типи
│   │   └── index.ts
│   ├── theme.ts                 # Тема Material-UI
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Статус реалізації

### ✅ Створено (Skeleton):
- [x] Структура проекту Backend
- [x] Структура проекту Frontend
- [x] Базові модулі та контролери
- [x] MongoDB схеми (частина)
- [x] Guards та декоратори
- [x] Routing (Frontend)
- [x] Layout компоненти
- [x] Базові сторінки

### ⏳ Потрібно реалізувати:
- [ ] Логіка в сервісах (замість `throw new Error('Not implemented')`)
- [ ] Повні MongoDB схеми для всіх сутностей
- [ ] Валідація DTO
- [ ] Реалізація форм на Frontend
- [ ] Інтеграція з API
- [ ] Тести
- [ ] Документація API (Swagger)

## Наступні кроки

1. **Backend:**
   - Реалізувати логіку аутентифікації
   - Створити всі MongoDB схеми
   - Реалізувати CRUD операції
   - Додати валідацію
   - Налаштувати завантаження файлів

2. **Frontend:**
   - Реалізувати форми
   - Додати таблиці та списки
   - Інтегрувати з API
   - Додати обробку помилок
   - Додати loading states

3. **Загальне:**
   - Додати тести
   - Налаштувати CI/CD
   - Додати Swagger документацію
   - Оптимізувати продуктивність

