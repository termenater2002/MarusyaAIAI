# Tasks: Страница авторизации пользователей

**Input**: Design documents from `/specs/004-auth-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; include if time permits.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm constraints and endpoints before coding

- [X] T001 Review scope, edge cases, and acceptance criteria in specs/004-auth-page/spec.md and research.md.
- [X] T002 Inspect auth contracts in specs/004-auth-page/contracts/auth.yaml to map response codes to UI states.
- [X] T003 Verify dev commands `npm test && npm run lint` in package.json for later gates.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers and layout for auth routes

- [X] T004 Create `(auth)` route segment and base layout scaffold in src/app/(auth)/layout.tsx if absent (minimal wrapper reusing global styles).
- [X] T005 Add email validation/util and fetch helper for auth calls in src/lib/auth-utils.ts (uses fetch, maps status codes to messages).

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Войти по email и паролю (Priority: P1) 🎯 MVP

**Goal**: Пользователь вводит email/пароль, получает редирект при успехе, видит ошибки без раскрытия деталей.

**Independent Test**: Заполнить валидные данные → редирект `/dashboard`; неверный пароль → текст ошибки, email остаётся, пароль очищен, кнопка блокируется во время запроса.

### Implementation for User Story 1

- [X] T006 [US1] Build login page skeleton with metadata and main container in src/app/(auth)/login/page.tsx.
- [X] T007 [US1] Implement client login form component with controlled fields, labels, and validation in src/app/(auth)/login/login-form.tsx.
- [X] T008 [US1] Wire submit to `POST /api/auth/login`, handle statuses 200/401/423/500, set redirect target (response.redirectTo or `/dashboard`) in src/app/(auth)/login/login-form.tsx.
- [X] T009 [US1] Add UI states: disabling during submit, spinner, aria-live error region, safe error copy, preserve email/clear password on error in src/app/(auth)/login/login-form.tsx.

**Checkpoint**: Авторизация по email/паролю работает с корректной обработкой ошибок.

---

## Phase 4: User Story 2 - Переключиться к регистрации (Priority: P2)

**Goal**: Видимая ссылка «Создать аккаунт» ведёт на страницу регистрации.

**Independent Test**: Клик «Создать аккаунт» открывает `/register` без перезагрузки.

### Implementation for User Story 2

- [X] T010 [US2] Add registration link with keyboard focus styles in src/app/(auth)/login/login-form.tsx.
- [X] T011 [US2] Update site header action (login/register) if needed for navigation consistency in src/lib/site-config.ts.

**Checkpoint**: Пользователь может перейти к регистрации из формы входа и через хедер.

---

## Phase 5: User Story 3 - Восстановление доступа (Priority: P3)

**Goal**: Пользователь инициирует восстановление с формы входа и получает подтверждение отправки.

**Independent Test**: Клик «Забыли пароль?» → форма восстановления; отправка валидного email показывает подтверждение/сообщение об отправке.

### Implementation for User Story 3

- [X] T012 [US3] Add “Забыли пароль?” link from login form to recovery route in src/app/(auth)/login/login-form.tsx.
- [X] T013 [US3] Create recovery page with email form and validation in src/app/(auth)/forgot-password/page.tsx.
- [X] T014 [US3] Wire recovery submit to `POST /api/auth/recover`, show success/neutral confirmation, handle 400/429/500 in src/app/(auth)/forgot-password/page.tsx.

**Checkpoint**: Восстановление инициируется из логина и подтверждается на отдельной странице.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Docs and quality gates

- [X] T015 [P] Update specs/004-auth-page/quickstart.md with actual routes/states (login/recover/register links).
- [X] T016 Run quality gates (`npm test && npm run lint`) after implementation.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 → US3 → Polish.
- US1 is MVP; US2/US3 can start after foundational helpers exist.

## Parallel Execution Examples

- After T004–T005, T006–T009 (login form) can proceed while another dev drafts recovery UI T013–T014.
- Header link update (T011) can run in parallel once login form structure is known.

## Implementation Strategy

1. Ship MVP with login form (US1) and redirect.
2. Add registration link (US2).
3. Add recovery flow (US3).
4. Update quickstart and run quality gates.
