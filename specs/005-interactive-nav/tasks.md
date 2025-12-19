# Tasks: Интерактивная кнопка навигации и страница гайдов

**Input**: Design documents from `/specs/005-interactive-nav/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; add if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope and routes

- [X] T001 Review spec and research in specs/005-interactive-nav/spec.md and research.md to lock requirements (single header CTA, guides page).
- [X] T002 Inventory existing header actions and routes in src/lib/site-config.ts and layout/header usage.
- [X] T003 Verify dev commands `npm test && npm run lint` for later gates.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Header action configuration

- [X] T004 Add/update header action for navigation/guide CTA in src/lib/site-config.ts pointing to `/navigation`.

**Checkpoint**: CTA route defined in config.

---

## Phase 3: User Story 1 - Кнопка навигации в хедере (Priority: P1) 🎯 MVP

**Goal**: Одна новая кнопка в хедере ведёт на внутреннюю страницу навигации/гайдов без перезагрузки.

**Independent Test**: Клик или активация клавиатурой по кнопке открывает `/navigation` без полной перезагрузки.

### Implementation for User Story 1

- [X] T005 [US1] Render CTA button from site-config in src/components/site-header.tsx with clear label and aria-label.
- [X] T006 [US1] Style CTA with hover/focus/active states and keyboard accessibility in src/components/site-header.tsx.

**Checkpoint**: Кнопка доступна и ведёт на нужный маршрут.

---

## Phase 4: User Story 2 - Страница навигации/гайдов (Priority: P2)

**Goal**: Статичная страница с секциями «Гайды», «Обновления», «Обратная связь».

**Independent Test**: Открыть `/navigation` и увидеть все секции с контентом; таб-навигация проходит по ссылкам/кнопкам.

### Implementation for User Story 2

- [X] T007 [US2] Create page scaffold with title/description in src/app/navigation/page.tsx.
- [X] T008 [US2] Add content sections (guides, updates, feedback) with semantic headings and body text in src/app/navigation/page.tsx.
- [X] T009 [US2] Ensure basic responsive layout and accessible roles/labels in src/app/navigation/page.tsx.

**Checkpoint**: Страница навигации отображает контент и доступна.

---

## Phase 5: User Story 3 - Визуальные состояния кнопки (Priority: P3)

**Goal**: CTA в хедере имеет чёткие hover/focus/active состояния и контраст.

**Independent Test**: Наведение, фокус и клик отображают визуальное состояние; кнопка остаётся доступной с клавиатуры.

### Implementation for User Story 3

- [X] T010 [US3] Apply and verify hover/focus/active styles on CTA in src/components/site-header.tsx.

**Checkpoint**: Визуальная обратная связь кнопки соответствует требованиям доступности.

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T011 [P] Update specs/005-interactive-nav/quickstart.md with CTA behavior and `/navigation` page details.
- [X] T012 Run quality gates (`npm test && npm run lint`) after implementation.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 → US3 → Polish.
- US2 depends on CTA route; US3 depends on CTA rendering.

## Parallel Execution Examples

- After T004, CTA rendering (T005–T006) and page scaffold (T007) can proceed in parallel.

## Implementation Strategy

1. Define CTA in config (Phase 2).
2. Render CTA in header (US1).
3. Build `/navigation` page (US2).
4. Polish button states and docs, run lint (US3 + Polish).
