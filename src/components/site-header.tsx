"use client";

import Link from "next/link";
import { BookOpen, Heart, LogIn } from "lucide-react";

import { MainNav } from "@/components/nav/main-nav";
import { MobileNav } from "@/components/nav/mobile-nav";
import { Button } from "@/components/ui/button";
import { MISSING_LABEL, siteConfig } from "@/lib/site-config";

const iconByAction = {
  login: LogIn,
  guides: BookOpen,
  favorites: Heart,
} as const;

export function SiteHeader() {
  const { header, navigation } = siteConfig;
  const navItems = navigation?.items ?? [];

  return (
    <header className="site-header border-border/60 bg-card text-foreground">
      <div className="site-container flex min-h-16 flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
        <div className="flex items-center gap-2">
          <MobileNav items={navItems} />
          <Link
            href={header.logo.href}
            aria-label={header.logo.ariaLabel ?? header.logo.label}
            className="group flex min-w-0 items-center gap-2"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold tracking-tight transition hover:border-primary sm:size-11">
              {header.fallback.logoText}
            </div>
            <span className="truncate text-base font-semibold leading-tight sm:text-lg">
              {header.logo.label}
            </span>
          </Link>
        </div>

        <MainNav items={navItems} className="flex-1 justify-center" />

        <nav className="ml-auto flex items-center gap-2">
          {header.actions.map((action) => {
            const Icon = iconByAction[action.id];
            if (!action.href) {
              return (
                <span
                  key={action.id}
                  className="min-h-[44px] min-w-[120px] rounded-md border border-dashed border-border/60 px-3 py-2 text-sm text-muted-foreground"
                  aria-label={header.fallback.missingLinkLabel ?? MISSING_LABEL}
                >
                  {header.fallback.missingLinkLabel ?? MISSING_LABEL}
                </span>
              );
            }

            return (
              <Button
                key={action.id}
                asChild
                variant={action.id === "guides" ? "default" : "outline"}
                size="sm"
                className="min-h-[44px] justify-center px-3"
              >
                <Link
                  href={action.href}
                  prefetch={false}
                  aria-label={action.ariaLabel ?? action.label}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {Icon ? <Icon className="size-4" aria-hidden /> : null}
                  <span>{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
