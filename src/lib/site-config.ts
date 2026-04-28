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
        name: "Email",
        href: "mailto:0the.l.lawliet@gmail.com",
        status: "active",
        ariaLabel: "Написать на email",
      },
    ] satisfies SocialLink[],
    contact: {
      email: "0the.l.lawliet@gmail.com",
      messenger: undefined,
    },
    policyLink: {
      label: "Правила обработки пользовательских данных",
      href: "/legal/privacy-policy",
    },
    meta: {
      updatedAt: "2026-04-28",
    },
  },
};
