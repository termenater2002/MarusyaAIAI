export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "ai-catalog-theme";

const isValidTheme = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark";

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    return isValidTheme(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveInitialTheme = (): {
  theme: ThemeMode;
  source: "system" | "user";
} => {
  const stored = getStoredTheme();
  if (stored) {
    return { theme: stored, source: "user" };
  }
  return { theme: getSystemTheme(), source: "system" };
};

export const applyThemeClass = (theme: ThemeMode): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.dataset.theme = theme;
};

export const persistTheme = (theme: ThemeMode): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
};
