# Quickstart: Интерактивный навигационный бар

## 1. Десктоп-меню
- Компонент `MainNav` в `src/components/nav/main-nav.tsx` читает пункты из `siteConfig.navigation.items`.
- Использует `next/link` и активную подсветку по `usePathname`/`isPathActive`.

## 2. SPA-навигация
- Все пункты используют `next/link` без перезагрузки страницы.

## 3. Адаптивность
- Мобильное меню `MobileNav` в `src/components/nav/mobile-nav.tsx` с бургер-триггером (Sheet).
- Десктоп-меню видно на `lg`, бургер — на мобильных.

## 4. Визуальная обратная связь
- Hover/focus стили и активные состояния для desktop/mobile пунктов.
- Активный пункт — `bg-primary/10 text-primary`.

## 5. Кнопка в хедере
- Дополнительный CTA ведёт на `/guides`, размещён в `siteConfig.header.actions` и рендерится в `site-header.tsx`.

## 6. Страница `/guides`
- Статические секции: гайды, обновления, обратная связь; связана с CTA из хедера.

## 7. Доступность
- `<nav>` с aria-label, aria-current на активных ссылках, focus ring, aria-label на кнопке бургера.

## 8. Проверка
- Пройтись по desktop/mobile, убедиться в подсветке активного пункта, работе CTA и отображении `/guides`.

---

**Пример импорта меню:**
```ts
import { navigationMenu } from 'src/lib/site-config';
```

**Пример использования:**
```tsx
<NavigationMenu items={navigationMenu.items} />
```
