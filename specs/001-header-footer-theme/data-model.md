# Data Model: Header & Footer with Theme Toggle

## HeaderBlock
- Fields: `logo` { `label` (ru), `href` (home route), `ariaLabel` }, `actions[]` { `id`: login|favorites, `label` (ru), `href`, `ariaLabel`, `icon` optional }, `layout` { `maxWidth`, `gap`, `align`, `breakpoints` }, `fallback` { `logoText`, `missingLinkLabel` default «Не указано» }.
- Relationships: Uses `ThemePreference.appliedClass` only for contrast awareness; otherwise independent.
- Validation: `href` must be relative or https; labels in Russian; tap targets ≥44px; no horizontal scroll at ≤320px; logo/link always present (fallback text if image absent).
- State: `actions` allow disabled state when route unavailable → show tooltip/text «Не указано» but remain non-clickable.

## FooterBlock
- Fields: `description` (ru, short), `socialLinks[]` { `name`, `href?`, `status`: active|missing|unverified, `ariaLabel` }, `contact` { `email?`, `messenger?` }, `policyLink?` { `label`, `href` }, `themeToggle` -> `ThemePreference`, `meta` { `updatedAt` text }.
- Relationships: Embeds `ThemePreference` control; references shared typography/colors from Tailwind theme tokens.
- Validation: Missing links render «Не указано»; all links open in new tab with `rel="noopener noreferrer"`; ensure readable contrast in both themes; maintain vertical spacing for 320px width.
- State: `status=missing` shows placeholder text; `status=unverified` appends «(Не проверено)».

## ThemePreference
- Fields: `effectiveTheme`: light|dark, `source`: system|user, `storageKey`: `ai-catalog-theme`, `persistence`: sessionStorage, `appliedClass`: `data-theme`/`class` on `<html>`, `timestamp?` for debugging display.
- Relationships: Footer toggle writes to `ThemePreference`; header/footer components read `effectiveTheme` to adjust classes/icons if needed.
- Validation: Default derives from `prefers-color-scheme`; if JS disabled, default to light; invalid stored values reset to system.
- State transitions:
  - On load: read sessionStorage → else `prefers-color-scheme` → set `effectiveTheme` and apply class before paint.
  - On toggle: switch between light/dark, set `source=user`, persist to sessionStorage, update DOM class immediately.
  - On session end: storage cleared; new session recalculates from system preference.
