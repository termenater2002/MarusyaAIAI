# Tasks: AI Tool Details & Pagination

**Input**: Design documents from `/specs/003-ai-tool-details/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec; focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution guardrails**: Keep tasks focused on internal navigation, client-only pagination, Russian-first copy, transparent aiData usage, and frontend-only delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope, data source, and dev commands before coding

- [X] T001 Review constraints and priorities in specs/003-ai-tool-details/spec.md and specs/003-ai-tool-details/plan.md to lock navigation/pagination scope.
- [X] T002 Validate aiData fields and ids in src/app/data/ai.ts to plan safe fallbacks and id-based lookup.
- [X] T003 Check dev commands in package.json against specs/003-ai-tool-details/quickstart.md to ensure `npm test && npm run lint` are ready to run.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers required by all user stories

- [X] T004 Add `getToolById` helper and null-safe field formatting utilities in src/app/lib/ai-utils.ts sourcing only src/app/data/ai.ts for reuse in cards, detail route, and pagination.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Переход с карточки на детальную (Priority: P1) 🎯 MVP

**Goal**: Card click opens internal detail page; external site only from a dedicated button.

**Independent Test**: На каталоге клик по любой карточке открывает внутренний маршрут `/ai/[id]`; клик по иконке в правом нижнем углу открывает внешний сайт в новой вкладке.

### Implementation for User Story 1

- [X] T005 [US1] Replace external anchor around tool name with internal Link to `/ai/${tool.id}` in src/app/components/ai-tool-card.tsx while keeping card body interactive.
- [X] T006 [US1] Make the card body (image/title/description area) route to the internal detail page via Next.js navigation without wrapping the whole card in an external link in src/app/components/ai-tool-card.tsx.
- [X] T007 [US1] Add a compact external-link button/icon pinned to the card’s bottom-right that uses `tool.url` with `externalLinkProps` in src/app/components/ai-tool-card.tsx.
- [X] T008 [US1] Adjust card layout/styling to keep external button focusable and prevent event bubbling from the card click target in src/app/components/ai-tool-card.tsx.

**Checkpoint**: Card navigation uses internal routing; external site reachable only via dedicated button.

---

## Phase 4: User Story 2 - Просмотр детальной страницы инструмента (Priority: P2)

**Goal**: Dynamic `/ai/[id]` page shows complete tool info from aiData with graceful 404.

**Independent Test**: Открыть `/ai/1` и увидеть name, description, longDescription, tags, rating, features, image и кнопку внешней ссылки; запрос `/ai/unknown` ведёт в notFound/возврат в каталог.

### Implementation for User Story 2

- [X] T009 [US2] Create dynamic route handler that resolves `params.id` with `getToolById` and calls `notFound()` on miss in src/app/ai/[id]/page.tsx.
- [X] T010 [US2] Render detail layout with name, description, longDescription, tags, rating (using formatRating), features, and image with fallbacks for missing fields in src/app/ai/[id]/page.tsx.
- [X] T011 [US2] Add external-link button on the detail page using `tool.url` + `externalLinkProps`, opening in new tab, in src/app/ai/[id]/page.tsx.
- [X] T012 [US2] Provide friendly not-found UI and link back to the catalog via src/app/ai/[id]/not-found.tsx (or inline export) aligned with App Router defaults.

**Checkpoint**: Detail page fully renders aiData or shows not-found recovery path.

---

## Phase 5: User Story 3 - Листание каталога с пагинацией (Priority: P3)

**Goal**: Catalog shows ≤15 tools per page with client-side pagination controls and active page state.

**Independent Test**: На каталоге видно не более 15 карточек; переключение по кнопкам/номерам обновляет список без полной перезагрузки, с отключением граничных кнопок и подсветкой активной страницы.

### Implementation for User Story 3

- [X] T013 [US3] Refactor grid to accept a `tools` prop instead of reading aiData directly in src/app/components/ai-tool-grid.tsx to allow page slices.
- [X] T014 [US3] Add pagination state (`page`, `pageSize=15`, `totalPages`) and slice logic using aiData in src/app/page.tsx, passing the current page slice into AIToolGrid.
- [X] T015 [US3] Implement pagination controls (prev/next + page indicator/buttons) with disabled boundaries and active styling in src/app/page.tsx or src/app/components/pagination-controls.tsx.
- [X] T016 [US3] Ensure pagination updates list without full reload (client state only) and hides/locks controls when totalPages ≤ 1 in src/app/page.tsx.

**Checkpoint**: Catalog paginates client-side with clear controls and no infinite scroll.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, docs, and quality gates

- [X] T017 [P] Document navigation, detail, and pagination behaviors in specs/003-ai-tool-details/quickstart.md based on implemented UI.
- [X] T018 Run quality gates (`npm test && npm run lint`) from package.json at repo root after feature completion.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (US1 → US2 → US3) → Polish.
- US1 depends on foundational helpers (T004) and enables internal navigation for later stories.
- US2 depends on T004 and benefits from US1 navigation but can be verified directly via `/ai/[id]`.
- US3 depends on T013–T016 requiring updated grid/page structure; conceptually independent of US2 but ships after navigation is stable.

## Parallel Execution Examples

- After T004, T005–T008 (US1 card changes) can proceed while another dev starts T009–T012 (US2 detail page).
- Within US3, T013 (grid refactor) and T015 (controls UI) can run in parallel once T014 defines pagination state contract.

## Implementation Strategy

1. MVP: Complete US1 to keep users inside the catalog while providing explicit external buttons.
2. Add US2 to deliver full detail content and graceful 404 handling.
3. Layer US3 pagination to keep the catalog manageable (15 items/page) without reloading.
4. Finish with polish/docs and run quality gates.
