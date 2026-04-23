"use client";

import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { MISSING_LABEL, siteConfig } from "@/lib/site-config";

const statusLabel = {
  missing: "не указано",
  unverified: "не проверено",
  active: "",
} as const;

export function SiteFooter() {
  const { footer } = siteConfig;

  return (
    <footer className="site-footer border-t border-border/60 bg-card text-foreground">
      <div className="site-container grid gap-6 py-8 sm:grid-cols-3 sm:items-start sm:gap-8">
        <div className="space-y-3">
          <h2 className="text-base font-semibold leading-tight">О проекте</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {footer.description}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold leading-tight">Контакты</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {footer.socialLinks.map((link) => {
              const badgeText = statusLabel[link.status];
              const badge = badgeText ? ` (${badgeText})` : "";

              if (!link.href) {
                return (
                  <li
                    key={link.name}
                    className="inline-flex min-h-[36px] max-w-full items-center rounded-full border border-dashed border-border/70 px-3 text-muted-foreground"
                    aria-label={link.ariaLabel ?? MISSING_LABEL}
                  >
                    {link.name}: {MISSING_LABEL}
                  </li>
                );
              }

              const isEmail = link.href.startsWith("mailto:");

              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-border/70 px-3 transition hover:border-primary hover:text-primary"
                    target={isEmail ? undefined : "_blank"}
                    rel={isEmail ? undefined : "noreferrer noopener"}
                    aria-label={link.ariaLabel ?? link.name}
                  >
                    {isEmail ? (
                      <Mail className="size-4" aria-hidden />
                    ) : (
                      <ExternalLink className="size-4" aria-hidden />
                    )}
                    <span>
                      {link.name}
                      {badge}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold leading-tight">Тема</h2>
          <ThemeToggle />
          <p className="text-xs text-muted-foreground">
            Выбор сохраняется в текущей вкладке и сбрасывается при новом визите.
          </p>
        </div>
      </div>

      <div className="site-container flex flex-wrap items-center justify-between gap-3 border-t border-border/50 py-3 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <span>Обновлено:</span>
          <span className="font-medium text-foreground">
            {footer.meta.updatedAt}
          </span>
        </div>
        {footer.policyLink?.href ? (
          <Link
            href={footer.policyLink.href}
            prefetch={false}
            className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
          >
            {footer.policyLink.label}
          </Link>
        ) : (
          <span>{MISSING_LABEL}</span>
        )}
      </div>
    </footer>
  );
}
