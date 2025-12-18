# Implementation Plan: AI Catalog Cards

**Branch**: `[001-ai-catalog-cards]` | **Date**: 2025-12-18 | **Spec**: specs/001-ai-catalog-cards/spec.md  
**Input**: Feature specification from `/specs/001-ai-catalog-cards/spec.md`

## Summary

Deliver a responsive catalog of AI-инструментов using only the existing static dataset `src/app/data/ai.ts`, showing for each card: название, краткое описание, рейтинг, и все теги, с явной маркировкой доступности в России и ценовой модели. Approach: client-rendered grid in the existing Next.js 16 + React 19 + Tailwind CSS 4 stack, no new backend; prioritize clarity, RU-first copy, and resilience to missing images or incomplete tags.

## Technical Context

**Language/Version**: TypeScript, Next.js 16 (App Router), React 19  
**Primary Dependencies**: Tailwind CSS 4, shadcn/ui primitives, lucide-react (already in repo)  
**Storage**: N/A (static data imported from `src/app/data/ai.ts`)  
**Testing**: `npm test && npm run lint` (project commands)  
**Target Platform**: Web (desktop + mobile responsive)  
**Project Type**: Single web app (Next.js frontend only)  
**Performance Goals**: Initial render of full `aiData` set (currently 19 items) within ~1s on mid-range mobile; smooth scroll at 60fps for the card grid  
**Constraints**: Frontend-only; must not alter or invent data; no filters/search/favorites; show RU availability/pricing visibly; links open externally  
**Scale/Scope**: Current dataset size (~19 tools) with headroom to 100 tools without layout breakage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarity: Minimal surface—cards only; no filters/search added. ✓
- Russian relevance: Region/pricing tags surfaced per spec; RU-first copy maintained. ✓
- Transparency: Cards expose availability and pricing tags; unknowns explicitly marked. ✓
- Moderation: No community submission flows introduced in this scope. ✓
- Incremental delivery: MVP = static cards from `aiData`; no backend. ✓
- Frontend independence: Uses static import; no APIs; works on static hosting. ✓

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-catalog-cards/
├── plan.md          # This file
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
├── contracts/       # Phase 1 output
└── tasks.md         # Phase 2 output (not created here)
```

### Source Code (repository root)

```text
src/
└── app/
    ├── data/            # ai.ts source-of-truth dataset
    ├── components/      # feature components live here (cards/grid)
    └── ...              # existing Next.js app structure

public/                  # static assets (images referenced by ai.ts)
tests/                   # project tests (add unit/render tests here if needed)
```

**Structure Decision**: Single Next.js frontend; feature components and styles live under `src/app` alongside existing data; no backend directories or API layers added.

## Complexity Tracking

No constitution violations or extra complexity to justify; table omitted.
