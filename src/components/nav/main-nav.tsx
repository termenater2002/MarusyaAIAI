"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type NavItem } from "@/lib/site-config";
import { isPathActive } from "@/lib/navigation-utils";
import { cn } from "@/lib/utils";

type Props = {
  items: NavItem[];
  className?: string;
};

export function MainNav({ items, className }: Props) {
  const pathname = usePathname() ?? "/";

  if (!items?.length) {
    return null;
  }

  return (
    <nav
      aria-label="Основная навигация"
      className={cn("hidden items-center gap-1 lg:flex", className)}
    >
      {items.map((item) => {
        const active = isPathActive(pathname, item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
