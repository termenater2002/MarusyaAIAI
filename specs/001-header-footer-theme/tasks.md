# Tasks: Header & Footer with Theme Toggle

**Input**: Design documents from `/home/termenater/ai-catalog/specs/001-header-footer-theme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the spec; focus on implementation and manual verification per independent tests below.

**Organization**: Tasks are grouped by user story so each slice ships independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure workspace and baseline assets are ready.

- [X] T001 Install dependencies via package-lock with `npm install` (package-lock.json)
- [X] T002 Review spec and plan to align on acceptance and constraints (`/home/termenater/ai-catalog/specs/001-header-footer-theme/spec.md`, `/home/termenater/ai-catalog/specs/001-header-footer-theme/plan.md`)
- [X] T003 [P] Inspect existing layout and Tailwind base imports to avoid duplication (`/home/termenater/ai-catalog/src/app/layout.tsx`, `/home/termenater/ai-catalog/src/app/globals.css`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme and config scaffolding required by all stories.

- [X] T004 Implement theme preference helper (system default + sessionStorage persistence + validation) in `/home/termenater/ai-catalog/src/lib/theme.ts`
- [X] T005 Create `ThemeProvider` that applies theme class to `<html>` and exposes toggle state in `/home/termenater/ai-catalog/src/app/theme-provider.tsx`
- [X] T006 [P] Define light/dark CSS variables and base theme styles (background/text/links) under data-theme selectors in `/home/termenater/ai-catalog/src/app/globals.css`
- [X] T007 [P] Add shared site config with header actions, footer links, and «Не указано» placeholders in `/home/termenater/ai-catalog/src/lib/site-config.ts`
- [X] T008 Update root layout to preload theme before paint and wrap app with `ThemeProvider` in `/home/termenater/ai-catalog/src/app/layout.tsx`

---

## Phase 3: User Story 1 - Быстрый доступ к навигации (Priority: P1) 🎯 MVP

**Goal**: Хедер с логотипом (ссылка на `/`), кнопками «Войти» и «Избранное», видимыми и кликабельными на всех страницах.

**Independent Test**: Открыть любую страницу и убедиться, что логотип и кнопки кликабельны на десктопе и мобильном без горизонтального скролла.

### Implementation for User Story 1

- [X] T009 [P] [US1] Build `SiteHeader` with logo link + CTA buttons using shadcn/ui primitives in `/home/termenater/ai-catalog/src/components/site-header.tsx`
- [X] T010 [US1] Integrate `SiteHeader` into the shared layout with appropriate container spacing in `/home/termenater/ai-catalog/src/app/layout.tsx`
- [X] T011 [P] [US1] Add focus rings and ≥44px tap targets for header controls in `/home/termenater/ai-catalog/src/app/globals.css`

**Checkpoint**: Header navigates to home/login/favorites without layout shift.

---

## Phase 4: User Story 2 - Понятный футер с инфо и темой (Priority: P2)

**Goal**: Футер с RU описанием проекта, соц/контакт ссылками и переключателем темы, работающим на всей странице.

**Independent Test**: Внизу страницы ссылки читаемы и ведут по назначению; переключатель темы меняет оформление страницы и сохраняет выбор на время визита.

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement accessible theme toggle (RU labels, aria-pressed) consuming ThemeProvider in `/home/termenater/ai-catalog/src/components/theme-toggle.tsx`
- [X] T013 [US2] Build `SiteFooter` with description, social/contact links, placeholders, and embedded theme toggle in `/home/termenater/ai-catalog/src/components/site-footer.tsx`
- [X] T014 [US2] Integrate `SiteFooter` into the shared layout and ensure navigation targets are wired in `/home/termenater/ai-catalog/src/app/layout.tsx`
- [X] T015 [P] [US2] Add footer spacing, link states, and default theme backgrounds (light/dark) in `/home/termenater/ai-catalog/src/app/globals.css`

**Checkpoint**: Footer visible on all pages; theme toggle affects entire page and persists per session.

---

## Phase 5: User Story 3 - Адаптация под мобильные размеры (Priority: P3)

**Goal**: Хедер и футер остаются читабельными и без налезаний на ширине ≤320 px; элементы кликабельны одним тапом.

**Independent Test**: При ширине до 320 px нет горизонтального скролла; логотип/кнопки/переключатель темы достижимы и не перекрыты.

### Implementation for User Story 3

- [X] T016 [P] [US3] Add responsive rules (stacking, gaps, text sizing) for header/footer at ≤768 px and safeguards for 320 px in `/home/termenater/ai-catalog/src/app/globals.css`
- [X] T017 [US3] Adjust header/footer components for wrapping long text/logo and CTA spacing at small widths in `/home/termenater/ai-catalog/src/components/site-header.tsx` and `/home/termenater/ai-catalog/src/components/site-footer.tsx`
- [ ] T018 [P] [US3] Validate mobile view at ≤320 px via browser devtools following `/home/termenater/ai-catalog/specs/001-header-footer-theme/quickstart.md` checklist

**Checkpoint**: Mobile layout passes 320 px checks without horizontal scroll or hidden controls.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and quality gates.

- [X] T019 [P] Document theme behavior, placeholders, and manual checks in `/home/termenater/ai-catalog/specs/001-header-footer-theme/quickstart.md`
- [X] T020 Run lint to confirm header/footer/theme changes pass CI expectations in `/home/termenater/ai-catalog/package.json`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (Phase 3/4/5) → Phase 6.
- User Story dependencies:
  - US1 depends on foundational theme/config (T004–T008).
  - US2 depends on foundational theme/config and header integration readiness; can start after Phase 2 (ideally after T010 to avoid layout conflicts).
  - US3 depends on header/footer presence (US1/US2) and theme styles (T006/T015) to validate responsive behavior.
- Tasks marked [P] can run in parallel when touching distinct files and after their prerequisites are satisfied.

## Parallel Execution Examples

- US1: T009 (header component) and T011 (focus/tap CSS) can proceed in parallel once T004–T008 complete; T010 follows to mount header.
- US2: T012 (toggle component) and T015 (footer styles) in parallel after Phase 2; T013 then T014 to integrate.
- US3: T016 (CSS breakpoints) and T018 (manual mobile validation setup) in parallel; T017 adjusts components afterward if needed.

## Implementation Strategy

- MVP first: Deliver Phase 1–2 then US1 to ship navigable header; validate independently.
- Incremental: Add US2 (footer + theme) next; validate theme persistence and links. Finish with US3 responsive refinements.
- Stop points after each story checkpoint to demo independently; Polish phase only after desired stories are stable.
