- Decision: Use Playwright smoke checks (header/footer visibility, theme toggle, mobile viewport) plus manual responsive/a11y review for this slice.
- Rationale: Next.js app is static and UI-only; Playwright is the lightest way to assert navigation/toggle behavior without backend; complements existing ESLint.
- Alternatives considered: Cypress (heavier setup); no automation (would miss regressions on future header/footer edits).

- Decision: Theme preference defaults to `prefers-color-scheme`, then sessionStorage-backed toggle (per tab) with immediate class application to avoid flash.
- Rationale: Spec wants session-only persistence; sessionStorage avoids cross-tab bleed and respects visit scope; applying the class on load prevents FOUC.
- Alternatives considered: localStorage (persists beyond visit); URL/query params (leaks state); cookies (overkill without backend).

- Decision: Keep header layout as simple flex with logo + two CTA buttons; on ≤768px stack or compress spacing so no hamburger needed for 3 items.
- Rationale: Minimal items fit within 320px when sized; avoids extra interaction depth; maintains clarity and tap targets ≥44px.
- Alternatives considered: Hamburger/drawer (adds clicks and complexity); horizontal scroll (violates acceptance criteria).

- Decision: Footer copy in Russian with social/contact links using labeled icons/text; show «Не указано» text placeholders when data missing.
- Rationale: Matches constitution transparency; prevents layout jumps when links absent; keeps content understandable for Russian users.
- Alternatives considered: Hiding missing links silently (hurts transparency); icon-only links (worse a11y).

- Decision: Theme switch UI uses accessible toggle (aria-pressed or checkbox) with visible labels «Светлая/Тёмная»; include focus rings and 44px min touch area.
- Rationale: Aligns with a11y/tap-size requirements; shadcn/ui primitives already provide focus management; Russian labels keep clarity.
- Alternatives considered: Icon-only moon/sun toggle (ambiguous); dropdown selector (extra tap).
