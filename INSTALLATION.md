# Інструкція з встановлення та запуску

## Backend

### 1. Встановлення залежностей

```bash
cd backend
npm install
```

### 2. Налаштування середовища

```bash
# Скопіювати .env.example в .env
cp .env.example .env

# Відредагувати .env файл з вашими налаштуваннями
```

### 3. Запуск MongoDB

```bash
# Якщо MongoDB встановлена локально
mongod

# Або використовуйте MongoDB Atlas (хмарна БД)
# Оновіть MONGODB_URI в .env
```

### 4. Запуск сервера

```bash
# Режим розробки (з hot reload)
npm run start:dev

# Продакшн режим
npm run build
npm run start:prod
```

Сервер буде доступний на: `http://localhost:3000/api/v1`

---

## Frontend

### 1. Встановлення залежностей

```bash
cd frontend
npm install
```

### 2. Налаштування середовища

Створіть файл `.env` в папці `frontend`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Запуск додатку

```bash
# Режим розробки
npm run dev

# Збірка для продакшну
npm run build
```

Додаток буде доступний на: `http://localhost:5173`

---

## Перший запуск

1. Запустіть MongoDB
2. Запустіть Backend (`npm run start:dev` в папці `backend`)
3. Запустіть Frontend (`npm run dev` в папці `frontend`)
4. Відкрийте браузер: `http://localhost:5173`
5. Увійдіть в адмін-панель (використовуйте дані з `.env`)

---

## Наступні кроки

1. Реалізувати логіку в сервісах (замість `throw new Error('Not implemented')`)
2. Додати валідацію DTO
3. Додати тести
4. Налаштувати CI/CD
5. Додати документацію API (Swagger)

