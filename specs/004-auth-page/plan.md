# Implementation Plan: Страница авторизации пользователей

**Branch**: `[004-auth-page]` | **Date**: 2025-12-19 | **Spec**: /home/termenater/ai-catalog/specs/004-auth-page/spec.md  
**Input**: Feature specification from `/specs/004-auth-page/spec.md`

## Summary

Создать страницу авторизации с формой email/пароль, клиентской валидацией и вызовом контрактов `/api/auth/login` и `/api/auth/recover`. Обеспечить состояния отправки/ошибок, безопасное отображение сообщений без раскрытия деталей, ссылки на регистрацию и восстановление пароля, редирект после успешного входа (default `/dashboard`). Сохранить доступность (labels, aria-live, клавиатурная навигация) и мобильную адаптивность.

## Technical Context

**Language/Version**: TypeScript, Next.js 16 (App Router), React 19  
**Primary Dependencies**: Tailwind CSS 4, shadcn/ui (Radix primitives), lucide-react, class-variance-authority/clsx utilities, react-hook-form (allowed), fetch API for contracts  
**Storage**: No local storage; relies on backend endpoints `/api/auth/login` and `/api/auth/recover` per `specs/004-auth-page/contracts/auth.yaml`  
**Testing**: `npm test && npm run lint` (no existing tests; optional component/e2e tests if added)  
**Target Platform**: Web (desktop + mobile)  
**Constraints**: SPA navigation; do not expose which credential is wrong; keep password field cleared on error; preserve email on error; links to `/register` and `/forgot-password`; form submit blocked during `submitting`

## Project Structure

```text
src/
└── app/
    ├── (auth)/
    │   ├── login/page.tsx          # новый маршрут логина
    │   ├── login/login-form.tsx    # клиентская форма
    │   └── forgot-password/page.tsx# восстановление (инициируется со страницы логина)
    ├── layout.tsx
    └── data/ai.ts                  # существующий каталог, не трогаем
src/lib/                            # shared utils (e.g., form helpers)
src/components/                     # shadcn/ui primitives; shared UI if reused
```

**Structure Decision**: Используем `(auth)` сегмент для страниц входа/восстановления; компоненты формы как клиентские; общие утилиты (валидация email, fetch helpers) в `src/lib/` при необходимости.

## Complexity Tracking

Небольшой объём: один маршрут логина + ссылка/роут восстановления; без расширенных состояний. Primary risk — корректная обработка ошибок и доступность.
