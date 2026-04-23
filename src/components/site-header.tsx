"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, LogIn, LogOut, Search, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutRequest } from "@/lib/auth-utils";
import { MISSING_LABEL, siteConfig } from "@/lib/site-config";

const iconByAction = {
  login: LogIn,
  navigation: BookOpen,
  favorites: Heart,
} as const;

type HeaderUser = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  emailVerified: boolean;
};

export function SiteHeader() {
  const { header } = siteConfig;
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as {
          user: HeaderUser;
        };

        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutRequest();

      setUser(null);
      router.refresh();
      router.push("/");
    });
  };

  return (
    <header className="site-header border-border/60 bg-card text-foreground">
      <div className="site-container flex min-h-16 flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
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

        <nav className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-none sm:gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Link href="/search/basic" aria-label="Открыть обычный поиск" prefetch={false}>
              <Search className="size-4" aria-hidden />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Link href="/search" aria-label="Открыть умный подбор инструментов" prefetch={false}>
              <Sparkles className="size-4" aria-hidden />
            </Link>
          </Button>

          {header.actions.map((action) => {
            if (action.id === "login" && user) {
              return null;
            }

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
                variant="outline"
                size="sm"
                className="min-h-[44px] flex-1 justify-center px-4 sm:flex-none"
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label={user.displayName ? `Профиль: ${user.displayName}` : "Профиль"}
                >
                  <UserRound className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  <LogOut className="size-4" aria-hidden />
                  <span>{isPending ? "Выходим..." : "Выйти"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
