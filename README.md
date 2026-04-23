# Marusya AI Catalog

Каталог ИИ и полезных инструментов на `Next.js`, `PostgreSQL`, `Firebase Auth` и `OpenAI`.

## Local Run

Заполни `.env.local`, затем запусти:

```bash
npm run dev
```

Приложение откроется на `http://localhost:3000`.

## Required Env

- `DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_UNVERIFIED_TTL_MINUTES`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_LOGO_DEV_TOKEN` (optional)

## Database Setup

После подключения базы выполни:

```bash
npm run db:init
npm run search:index
```

`db:init` применяет схему и сиды, а `search:index` строит индекс умного поиска.

## Vercel + Neon

Рекомендуемый прод-стек:
- `Vercel` для приложения
- `Neon Postgres 18` для базы

Шаги:
- создать проект в `Neon`
- вставить строку подключения в `DATABASE_URL` на `Vercel`
- добавить все env из списка выше в `Vercel Project Settings`
- задеплоить проект
- после деплоя один раз выполнить `npm run db:init`
- затем выполнить `npm run search:index`

## Notes

- auth-cookie в продакшне автоматически ставится с `secure=true`
- неподтверждённые Firebase-аккаунты могут освобождать email через `10` минут
- для этого используются server-side переменные `FIREBASE_ADMIN_*`
