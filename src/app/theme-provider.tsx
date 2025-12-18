"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  applyThemeClass,
  getStoredTheme,
  persistTheme,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  source: "system" | "user";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "light";
    const datasetTheme = document.documentElement.dataset.theme;
    if (datasetTheme === "dark" || datasetTheme === "light") {
      return datasetTheme;
    }
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });
  const [source, setSource] = useState<"system" | "user">(() => {
    if (typeof window === "undefined") return "system";
    return getStoredTheme() ? "user" : "system";
  });
  const sourceRef = useRef<"system" | "user">(source);

  const setAndPersist = useCallback((next: ThemeMode) => {
    setThemeState(next);
    setSource("user");
    sourceRef.current = "user";
    applyThemeClass(next);
    persistTheme(next);
  }, []);

  useEffect(() => {
    applyThemeClass(theme);
    if (source === "user") {
      persistTheme(theme);
    }
    sourceRef.current = source;
  }, [source, theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = (event: MediaQueryListEvent) => {
      if (sourceRef.current === "system") {
        setThemeState(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handleMedia);
    return () => media.removeEventListener("change", handleMedia);
  }, []);

  const toggleTheme = useCallback(() => {
    setAndPersist(theme === "dark" ? "light" : "dark");
  }, [setAndPersist, theme]);

  const setTheme = useCallback(
    (next: ThemeMode) => setAndPersist(next),
    [setAndPersist],
  );

  const value = useMemo(
    () => ({
      theme,
      source,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, source, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
