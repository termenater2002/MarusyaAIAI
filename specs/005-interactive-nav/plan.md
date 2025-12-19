# Implementation Plan: Интерактивный навигационный бар на главной странице

**Branch**: `[005-interactive-nav]` | **Date**: 2025-12-19 | **Spec**: /home/termenater/ai-catalog/specs/005-interactive-nav/spec.md  
**Input**: Feature specification from `/specs/005-interactive-nav/spec.md`

## Summary

Усилить шапку сайта интерактивной навигацией: кликабельные пункты каталога с SPA-переходами, hover/active подсветкой, адаптивным бургер-меню для мобильных и анимациями/состояниями активного раздела. Добавить отдельную кнопку в хедере на внутреннюю страницу с гайдами/обновлениями/обратной связью.

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
    ├── nav/main-nav.tsx           # desktop nav
    └── nav/mobile-nav.tsx         # mobile/burger menu
src/app/guides/page.tsx            # страница с гайдами/обновлениями/обратной связью
src/lib/site-config.ts             # nav items + header actions
src/lib/navigation-utils.ts        # active-path helper
src/app/layout.tsx                 # consumes SiteHeader
```

**Structure Decision**: Расширяем `SiteHeader`, выносим навигацию в отдельные компоненты (desktop/mobile), читаем пункты из конфигурации, подсвечиваем активный путь, добавляем отдельную кнопку/ссылку на страницу гайдов.

## Complexity Tracking

Небольшая сложность: статичное меню + бургер + одна контентная страница для гайдов/обновлений/фидбека. Риск — корректное определение активного маршрута и а11y на мобильных.***
