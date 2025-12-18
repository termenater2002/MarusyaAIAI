# Contracts: AI Catalog Cards (Frontend-Only)

## Data Source Contract
- Source of truth: `src/app/data/ai.ts` exported `aiData` array and `categories`.
- No external API calls or backend endpoints are introduced in this feature.
- UI must render one card per `aiData` entry; zero fabrication or omission.

## Interaction Contract
- Outbound navigation: Card title/link opens `url` in a new tab/window.
- Missing data handling: If pricing or region tags are absent, UI displays explicit “не указана” messages; image failures show a placeholder while preserving text content.

## Non-Goals Contract
- No filters, search, personalization, favorites, or submission flows are part of this release.
- No authentication or server-side persistence is added.
