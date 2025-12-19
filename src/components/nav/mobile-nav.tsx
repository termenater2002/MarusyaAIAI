"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type NavItem } from "@/lib/site-config";
import { isPathActive } from "@/lib/navigation-utils";
import { cn } from "@/lib/utils";

type Props = {
  items: NavItem[];
  className?: string;
};

export function MobileNav({ items, className }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  if (!items?.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center lg:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="rounded-md"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>Навигация</SheetTitle>
          </SheetHeader>
          <nav
            aria-label="Мобильное меню"
            className="mt-6 flex flex-col gap-1"
          >
            {items.map((item) => {
              const active = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
