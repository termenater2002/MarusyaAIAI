# Quickstart: AI Catalog Cards

1) Checkout branch `001-ai-catalog-cards`.
2) Install deps if needed: `npm install`.
3) Run quality gates: `npm test && npm run lint`.
4) Start dev server: `npm run dev` and open the catalog page.
5) Verify UI against spec: count cards equals `aiData` length; each card shows name, description, rating (1 decimal), all tags; pricing/region clearly visible or marked “не указана”; links open in new tab; mobile layout collapses to single column without horizontal scroll.
6) If images 404, ensure placeholders appear and text remains readable.
