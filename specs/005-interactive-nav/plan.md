# Implementation Plan: Интерактивный навигационный бар на главной странице

**Branch**: `[005-interactive-nav]` | **Date**: 2025-12-19 | **Spec**: /home/termenater/ai-catalog/specs/005-interactive-nav/spec.md  
**Input**: Feature specification from `/specs/005-interactive-nav/spec.md`

## Summary

Усилить шапку одной новой кнопкой, ведущей на внутреннюю страницу с навигацией/гайдами/обновлениями/обратной связью. Без отдельного меню или бургера; SPA-переход по кнопке.

## Technical Context

**Language/Version**: TypeScript, Next.js 16 (App Router), React 19  
**Primary Dependencies**: Tailwind CSS 4, shadcn/ui (Radix primitives), lucide-react, class-variance-authority/clsx utilities  
**Storage**: Static navigation config (no backend) defined in `src/lib/site-config.ts`  
**Testing**: `npm test && npm run lint` (no existing nav tests; optional component tests if added)  
**Target Platform**: Web, responsive (320px+)  
**Constraints**: SPA navigation via `next/link`; avoid page reloads; clear hover/active states; burger menu for small screens; dedicated header CTA to guides/updates/feedback page.

## Project Structure

```text
src/
└── components/
    ├── site-header.tsx            # existing header entry point
src/app/navigation/page.tsx        # страница с гайдами/обновлениями/обратной связью
src/lib/site-config.ts             # header actions (CTA to navigation page)
src/app/layout.tsx                 # consumes SiteHeader
```

**Structure Decision**: Добавляем одну CTA в `SiteHeader` через `siteConfig.header.actions`, страница навигации статична под `/navigation`. Никаких доп. меню/бургеров.

## Complexity Tracking

Небольшая сложность: статичное меню + бургер + одна контентная страница для гайдов/обновлений/фидбека. Риск — корректное определение активного маршрута и а11y на мобильных.***
