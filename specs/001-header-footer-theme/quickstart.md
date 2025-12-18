# Quickstart: Header & Footer with Theme Toggle

## Prereqs
- Node.js 18+; npm (package-lock present).
- Browser that respects `prefers-color-scheme` for default theme.

## Run locally
1) Install deps: `npm install`
2) Start dev server: `npm run dev` (http://localhost:3000)
3) Lint: `npm run lint`

## What to verify
- Header shows логотип (link to `/`), «Войти» → `/login`, «Избранное» → `/favorites`; all tappable at ≤320 px without horizontal scroll; header stays visible and focusable.
- Footer displays RU description + соц/контакт ссылки; missing links render «Не указано» или статус «не проверено».
- Theme toggle in footer switches light/dark instantly; default follows system theme; выбор сохраняется только в текущей вкладке/сессии.
- On resize to 320 px: элементы не перекрываются, фокусные состояния видны, текст не обрезан.

## Optional automation (planned)
- Add Playwright for smoke tests (header/footer presence, nav links, theme toggle, 320px viewport): `npm create playwright@latest` → keep headed chromium-only suite; run with `npx playwright test`.
