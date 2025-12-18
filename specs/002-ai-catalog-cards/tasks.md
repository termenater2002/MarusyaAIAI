# Tasks: AI Catalog Cards

**Input**: Design documents from `/specs/001-ai-catalog-cards/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare typed data and assets for the catalog

- [X] T001 Add `AITool`/`Category` TypeScript interfaces and typed exports for `aiData` in `src/app/data/ai.ts`
- [X] T002 [P] Add neutral placeholder asset for missing tool images at `public/images/ai-placeholder.png`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base scaffolding and shared helpers required before user stories

- [X] T003 Create catalog page shell (section layout, content container) in `src/app/page.tsx` to host the grid instead of placeholder cards
- [X] T004 [P] Add helpers for one-decimal rating formatting and safe external link props in `src/app/lib/ai-utils.ts`

**Checkpoint**: Foundation ready — user stories can now start

---

## Phase 3: User Story 1 - Быстрый обзор инструментов (Priority: P1) 🎯 MVP

**Goal**: Каталог сразу показывает название, краткое описание, рейтинг и теги каждого сервиса из `aiData` в сетке

**Independent Test**: Открыть каталог и убедиться, что количество карточек равно длине `aiData`, каждая карточка показывает название, описание, рейтинг (1 знак после запятой), все теги в исходном порядке, а название/ссылка ведёт на `url` в новой вкладке

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement `AIToolCard` component showing name, description, rating (1 decimal), all tags in order, and external link on title in `src/app/components/ai-tool-card.tsx`
- [X] T006 [US1] Implement `AIToolGrid` that maps `aiData` in source order to `AIToolCard` instances with base 3/2/1 grid classes in `src/app/components/ai-tool-grid.tsx`
- [X] T007 [US1] Render `AIToolGrid` on the landing page using static import from `src/app/data/ai.ts`, ensuring card count matches dataset and links open in a new tab in `src/app/page.tsx`

**Checkpoint**: User Story 1 delivers a visible grid of real AI tools with core fields

---

## Phase 4: User Story 2 - Понимание доступности и стоимости (Priority: P2)

**Goal**: Карточки явно показывают доступность в России и ценовой статус или честную пометку «не указана», не скрывая исходные теги

**Independent Test**: Проверить карточки с тегами "Не работает в России" и ценовыми тегами; статусы видны без кликов. Для карточек без таких тегов отображаются фразы об отсутствии данных

### Implementation for User Story 2

- [ ] T008 [P] [US2] Add availability/pricing parsing helper deriving statuses and fallbacks from `AITool.tags` in `src/app/lib/ai-tags.ts`
- [ ] T009 [US2] Surface availability and pricing badges/fallback messages alongside tags in `src/app/components/ai-tool-card.tsx` using the helper, keeping original tag order intact
- [ ] T010 [US2] Style availability/pricing indicators to be visually prominent near title/metadata without altering data in `src/app/components/ai-tool-card.tsx`

**Checkpoint**: User Story 2 highlights RU availability and pricing clarity for every card

---

## Phase 5: User Story 3 - Просмотр на мобильном (Priority: P3)

**Goal**: На ширине ≤375px каталог читается без горизонтального скролла, в одну колонку, с удобными тач-целями

**Independent Test**: Открыть каталог при ширине ≤375px: сетка в одну колонку, текст читаемый, ссылки кликаются с первого нажатия, теги/бейджи не обрезаются

### Implementation for User Story 3

- [ ] T011 [P] [US3] Tune grid breakpoints and spacing for ≤375px (одна колонка, без горизонтального скролла) in `src/app/components/ai-tool-grid.tsx` and `src/app/page.tsx`
- [ ] T012 [P] [US3] Adjust `AIToolCard` mobile layout (tap target sizing, text wrapping for long names/tags, image fallback sizing) in `src/app/components/ai-tool-card.tsx`
- [ ] T013 [US3] Add mobile-focused styles for tag/badge wrapping and font scaling to keep text readable at 320px in `src/app/globals.css`

**Checkpoint**: User Story 3 ensures mobile-first readability and usability

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and docs alignment

- [ ] T014 [P] Handle missing/failed images with placeholder rendering and alt text in `src/app/components/ai-tool-card.tsx`
- [ ] T015 [P] Update `specs/001-ai-catalog-cards/quickstart.md` with catalog verification steps (counts, statuses, responsive) reflecting implemented UI

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish
- Story dependencies: US2 builds on US1 card/grid; US3 refines layouts from US1/US2
- Within each story: grid before page wiring if shared styles need tweaks; helpers before component styling updates

## Parallel Execution Examples

- Run T001 and T002 in parallel (types vs. assets)
- US1: T005 (card) and T006 (grid) can start once T004 is ready; page wiring T007 follows
- US2: T008 helper can start immediately; T009/T010 proceed after helper
- US3: T011 (grid) and T012 (card) can run in parallel; T013 applies shared CSS

## Implementation Strategy

- MVP = Complete US1 (cards + grid from `aiData`)
- Then add clarity (US2) and mobile refinements (US3); stop after each checkpoint for demo

## Task Counts

- Total tasks: 15
- By story: US1 (3), US2 (3), US3 (3)
- Parallelizable tasks marked [P]: T002, T004, T005, T008, T011, T012, T014, T015
