"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PrimaryNavItem } from "@/lib/site-config";

const MOBILE_MENU_ID = "primary-navigation-mobile";

type PrimaryNavigationProps = {
  items: PrimaryNavItem[];
  className?: string;
};

export function PrimaryNavigation({ items, className }: PrimaryNavigationProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState(() => items[0]?.id ?? "");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveId(hash);
    }
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const scrollToId = React.useCallback((targetId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${targetId}`);
    }
  }, []);

  const handleNavigate = React.useCallback(
    (item: PrimaryNavItem) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      const targetId = item.href.startsWith("#")
        ? item.href.slice(1)
        : item.href.replace(/^.*#/, "");

      if (targetId) {
        event.preventDefault();
        scrollToId(targetId);
        setActiveId(targetId);
        setMobileOpen(false);
      }
    },
    [scrollToId]
  );

  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-full md:hidden"
        aria-haspopup="menu"
        aria-controls={MOBILE_MENU_ID}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        <span className="sr-only">
          {mobileOpen ? "Закрыть навигацию" : "Открыть навигацию"}
        </span>
      </Button>

      <NavigationMenu
        className="hidden md:flex"
        viewport={false}
        aria-label="Основные разделы сайта"
      >
        <NavigationMenuList className="justify-end">
          {items.map((item) => (
            <NavigationMenuItem key={item.id}>
              <NavigationMenuLink
                asChild
                data-active={activeId === item.id || undefined}
              >
                <Link
                  href={item.href}
                  prefetch={false}
                  scroll={false}
                  aria-label={item.ariaLabel ?? item.label}
                  onClick={handleNavigate(item)}
                  className="px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {mobileOpen ? (
        <React.Fragment>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div
            id={MOBILE_MENU_ID}
            className="fixed inset-x-4 top-[72px] z-50 rounded-lg border border-border bg-card p-4 shadow-lg md:hidden"
          >
            <nav aria-label="Основные разделы сайта">
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      scroll={false}
                      aria-label={item.ariaLabel ?? item.label}
                      onClick={handleNavigate(item)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-base font-medium transition hover:bg-accent/70 hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        activeId === item.id
                          ? "bg-accent/70 text-accent-foreground"
                          : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </React.Fragment>
      ) : null}
    </div>
  );
}
