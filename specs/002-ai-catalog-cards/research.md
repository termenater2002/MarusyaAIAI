# Research: AI Catalog Cards

## Findings

### Decision: Use static import of `aiData` as the only data source
- Rationale: Spec mandates using only existing data from `src/app/data/ai.ts` without invention or augmentation; static import aligns with frontend-only constraint and zero backend reliance.
- Alternatives considered: Fetching data via API (rejected—backend out of scope); duplicating data in JSON for fetch (rejected—risks divergence from source of truth).

### Decision: Surface availability/pricing directly from tags with explicit fallbacks
- Rationale: Spec and success criteria require instant understanding of RU availability and pricing; some entries lack explicit region/price tags, so fallback copy prevents silent omissions.
- Alternatives considered: Hiding missing fields (rejected—hurts transparency); inferring status heuristically (rejected—would fabricate data).

### Decision: Responsive CSS grid with breakpoints ≥1024px=3+ cols, 640–1023px=2+ cols, <640px=1 col
- Rationale: Matches FR-006 acceptance expectations and keeps mobile readability (P3 story).
- Alternatives considered: Masonry/auto-fit without guarantees (rejected—could violate column minimums); horizontal scroll on mobile (rejected—breaks mobile acceptance).

### Decision: Image fallback placeholder when asset missing
- Rationale: Edge case requires cards stay readable if image path fails; placeholder avoids layout shift and preserves text clarity.
- Alternatives considered: Hiding the image area (rejected—layout collapse); blocking card render (rejected—data loss and violates SC-004).
