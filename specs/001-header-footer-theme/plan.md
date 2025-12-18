# Implementation Plan: Header & Footer with Theme Toggle

**Branch**: `001-header-footer-theme` | **Date**: 2025-12-13 | **Spec**: /home/termenater/ai-catalog/specs/001-header-footer-theme/spec.md
**Input**: Feature specification from `/specs/001-header-footer-theme/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a responsive header (логотип-ссылка на главную + кнопки «Войти»/«Избранное») and footer (краткое описание, соц/контактные ссылки, переключатель темы) for the static Next.js 16 app. Default theme follows `prefers-color-scheme`; user toggle in the footer switches light/dark instantly across the page and persists for the session without backend storage. Tailwind CSS 4 + shadcn/ui (Radix-based) components and client-side state only; Russian-first copy and accessible focus/aria.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript, Next.js 16 (App Router), React 19  
**Primary Dependencies**: Tailwind CSS 4, shadcn/ui (Radix primitives), lucide-react icons, clsx/cva utilities  
**Storage**: N/A (static assets + client-side theme memory)  
**Testing**: ESLint (configured); Playwright smoke checks for header/footer/theme + manual responsive/accessibility review  
**Target Platform**: Static/edge-hostable web (Next.js app directory)  
**Project Type**: Single web frontend (no backend)  
**Performance Goals**: Theme toggle re-render <1s; no layout shift; no horizontal scroll at ≤320 px  
**Constraints**: No backend calls; respect system `prefers-color-scheme`; keep tap targets ≥44px; Russian copy/aria  
**Scale/Scope**: Site-wide header/footer components reused on all pages; mobile-first layouts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarity: Navigation limited to логотип + 2 CTA; concise footer copy; focus states and aria kept simple.
- Russian relevance: All labels/tooltips in Russian; footer can surface region/VPN/payment notices alongside соцссылки.
- Transparency: Missing links display «Не указано» placeholders to avoid silent omissions.
- Moderation: No community inputs added; existing content remains static/manual.
- Incremental delivery: MVP is header/footer + theme toggle; page content unchanged; shippable without backend.
- Frontend independence: Pure client-side theme state; works in static export/edge without server persistence.

*Post-Phase 1 re-check*: No new risks identified; transparency placeholders and frontend-only approach retained.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       └── navigation-menu.tsx
└── lib/
    └── utils.ts
```

**Structure Decision**: Single Next.js App Router project. Header/footer/theme components will live under `src/app` and `src/components` with reuse via shadcn/ui primitives; no backend directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
