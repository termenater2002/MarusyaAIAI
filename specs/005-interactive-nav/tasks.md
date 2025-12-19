# Tasks: Интерактивный навигационный бар на главной странице

**Input**: Design documents from `/specs/005-interactive-nav/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; add if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm navigation scope and routes

- [X] T001 Review spec and research in specs/005-interactive-nav/spec.md and research.md to lock required interactions (hover/active, burger, header CTA).
- [X] T002 Inventory existing routes/anchors for nav items (e.g., `/`, `/login`, `/forgot-password`) in src/lib/site-config.ts and app pages.
- [X] T003 Verify dev commands `npm test && npm run lint` for later gates.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralize navigation data

- [X] T004 Define/update navigation items and header CTA (guides page) in src/lib/site-config.ts for reuse by desktop/mobile nav.
- [X] T005 Add nav utility for active path matching (pathname comparer) in src/lib/navigation-utils.ts.

**Checkpoint**: Nav data and helpers ready for UI.

---

## Phase 3: User Story 1 - Основная навигация (Priority: P1) 🎯 MVP

**Goal**: Пункты меню на главной ведут по разделам без перезагрузки, имеют hover-эффект; хедер содержит кнопку на страницу гайдов/обновлений/обратной связи.

**Independent Test**: Клик по каждому пункту открывает нужный раздел SPA; hover визуально выделяет; кнопка в хедере ведёт на страницу гайдов.

### Implementation for User Story 1

- [X] T006 [US1] Create desktop nav component rendering config-driven items with `next/link` in src/components/nav/main-nav.tsx.
- [X] T007 [US1] Integrate `MainNav` into header flow in src/components/site-header.tsx, ensuring layout alignment with logo/actions and header CTA.
- [X] T008 [US1] Add hover/focus styles for nav items using Tailwind classes in src/components/nav/main-nav.tsx.
- [X] T009 [US1] Add header CTA/button linking to guides/updates/feedback page using site-config data in src/components/site-header.tsx.

**Checkpoint**: Базовая навигация работает на десктопе без перезагрузки, CTA доступна.

---

## Phase 4: User Story 2 - Адаптивность навигации (Priority: P2)

**Goal**: Бургер-меню на мобильных, открывающее список разделов.

**Independent Test**: На ширине <768px бургер раскрывает список, доступен клавиатурой, закрывается по выбору.

### Implementation for User Story 2

- [X] T010 [US2] Add mobile nav component with burger toggle and menu list in src/components/nav/mobile-nav.tsx.
- [X] T011 [US2] Wire responsive visibility (desktop vs mobile) and focus management in src/components/site-header.tsx.
- [X] T012 [US2] Ensure menu items use `next/link` and close menu on navigation in src/components/nav/mobile-nav.tsx.

**Checkpoint**: Навигация доступна на мобильных через бургер.

---

## Phase 5: User Story 3 - Визуальная обратная связь (Priority: P3)

**Goal**: Активный пункт выделяется, переходы плавные; страница гайдов доступна и связана с хедером.

**Independent Test**: При переходе активный пункт подсвечен на desktop/mobile; hover/active анимации присутствуют; страница гайдов/обновлений/фидбека открывается из хедера и отображает контент.

### Implementation for User Story 3

- [X] T013 [US3] Use pathname matching helper to highlight active item in src/components/nav/main-nav.tsx.
- [X] T014 [US3] Apply active-state styles to mobile nav items in src/components/nav/mobile-nav.tsx.
- [X] T015 [US3] Create guides/updates/feedback page at src/app/guides/page.tsx linked from header CTA.

**Checkpoint**: Пользователь получает визуальную обратную связь на всех устройствах, новая страница доступна.

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T016 [P] Update specs/005-interactive-nav/quickstart.md with desktop/mobile behavior, active-state cues, and header CTA to guides page.
- [X] T017 Run quality gates (`npm test && npm run lint`) after implementation.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 → US3 → Polish.
- US2/US3 depend on nav config and integration from US1.

## Parallel Execution Examples

- After nav config (T004–T005), desktop nav (T006–T008) and mobile shell (T010) can proceed in parallel by different devs.
- Active-state styling (T013–T014) and guides page (T015) follow once base components render links.

## Implementation Strategy

1. Deliver desktop nav + CTA (US1) for MVP.
2. Add mobile burger (US2).
3. Layer active/animation polish and guides page (US3).
4. Update quickstart and run lint/tests.
