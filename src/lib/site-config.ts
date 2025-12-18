export type NavAction = {
  id: "login" | "favorites";
  label: string;
  href: string;
  ariaLabel?: string;
};

export type PrimaryNavItem = {
  id: string;
  label: string;
  href: string;
  ariaLabel?: string;
};

export type SocialLinkStatus = "active" | "missing" | "unverified";

export type SocialLink = {
  name: string;
  href?: string;
  status: SocialLinkStatus;
  ariaLabel?: string;
};

export const MISSING_LABEL = "Не указано";

export const siteConfig = {
  name: "AI Каталог",
  description:
    "Подборка AI-инструментов с понятными шагами доступа и подсказками для РФ. Проект в активной разработке.",
  header: {
    logo: {
      label: "AI Каталог",
      href: "/",
      ariaLabel: "На главную",
    },
    navigation: {
      items: [
        {
          id: "catalog",
          label: "Каталог",
          href: "#catalog",
          ariaLabel: "Перейти к разделу каталога",
        },
        {
          id: "guides",
          label: "Гайды",
          href: "#guides",
          ariaLabel: "Перейти к разделу гайдов",
        },
        {
          id: "updates",
          label: "Обновления",
          href: "#updates",
          ariaLabel: "Перейти к разделу обновлений",
        },
        {
          id: "feedback",
          label: "Обратная связь",
          href: "#feedback",
          ariaLabel: "Перейти к разделу обратной связи",
        },
      ] satisfies PrimaryNavItem[],
    },
    actions: [
      {
        id: "login",
        label: "Войти",
        href: "/login",
        ariaLabel: "Перейти к авторизации",
      },
      {
        id: "favorites",
        label: "Избранное",
        href: "/favorites",
        ariaLabel: "Открыть избранное",
      },
    ] satisfies NavAction[],
    fallback: {
      logoText: "AI",
      missingLinkLabel: MISSING_LABEL,
    },
  },
  footer: {
    description:
      "Мы собираем рабочие AI-инструменты и отмечаем требования: VPN, оплата, язык интерфейса.",
    socialLinks: [
      {
        name: "Telegram",
        href: undefined,
        status: "missing",
        ariaLabel: "Ссылка на Telegram: не указано",
      },
      {
        name: "YouTube",
        href: undefined,
        status: "missing",
        ariaLabel: "Ссылка на YouTube: не указано",
      },
      {
        name: "Email",
        href: "mailto:contact@ai-catalog.local",
        status: "unverified",
        ariaLabel: "Написать на email",
      },
    ] as const,
    contact: {
      email: "contact@ai-catalog.local",
      messenger: undefined,
    },
    policyLink: {
      label: "Политика и условия",
      href: "#",
    },
    meta: {
      updatedAt: "2025-12-13",
    },
  },
};
