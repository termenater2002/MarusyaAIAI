# Quickstart: AI Tool Details & Pagination

1) Checkout branch `003-ai-tool-details`.
2) Install deps if needed: `npm install`.
3) Run quality gates: `npm test && npm run lint` (lint is expected to pass; no automated tests provided).
4) Start dev server: `npm run dev` and open the catalog page.
5) Verify catalog behavior: only 15 cards render per page; pagination controls switch slices without full reload; prev/next disabled at boundaries; active page highlighted; pagination hidden/disabled if only one page.
6) Verify navigation: clicking card body opens internal `/ai/[id]`; compact external button in the bottom-right of the card opens the tool site in a new tab; no other element opens external URLs.
7) Verify detail page: fields from `aiData` show with fallbacks for missing image/features; 404/not-found shown for invalid id with a return-to-catalog link; external button present and opens in new tab.
