"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`Переключить тему: ${
        isDark ? "Тёмная" : "Светлая"
      }`}
      className="theme-toggle min-h-[44px] px-4"
    >
      {isDark ? (
        <Moon className="size-4" aria-hidden />
      ) : (
        <Sun className="size-4" aria-hidden />
      )}
      <span className="text-sm font-medium">
        {isDark ? "Тёмная" : "Светлая"}
      </span>
    </Button>
  );
}
