export type NavAction = {
  id: "login" | "navigation" | "favorites";
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
      label: "Каталог ИИ и полезных инструментов",
      href: "/",
      ariaLabel: "На главную",
    },
    actions: [
      {
        id: "navigation",
        label: "Навигация",
        href: "/navigation",
        ariaLabel: "Открыть страницу с гайдами и обновлениями",
      },
      {
        id: "favorites",
        label: "Избранное",
        href: "/favorites",
        ariaLabel: "Открыть избранное",
      },
      {
        id: "login",
        label: "Войти",
        href: "/login",
        ariaLabel: "Перейти к авторизации",
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
    ] satisfies SocialLink[],
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
