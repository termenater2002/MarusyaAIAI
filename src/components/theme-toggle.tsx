"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/theme-provider";

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = theme === "dark";
  const label = mounted ? (isDark ? "Тёмная" : "Светлая") : "Тема";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-pressed={mounted ? isDark : undefined}
      aria-label={`Переключить тему: ${label}`}
      className="theme-toggle min-h-[44px] px-4"
    >
      {mounted && isDark ? (
        <Moon className="size-4" aria-hidden />
      ) : (
        <Sun className="size-4" aria-hidden />
      )}
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
