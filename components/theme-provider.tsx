"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme | ((theme: Theme) => Theme)) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  themes: Theme[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "theme";
const THEME_CLASSES = ["light", "dark"];
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
}

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}

  return defaultTheme;
}

function disableTransitions() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important}",
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => document.head.removeChild(style), 1);
  };
}

function applyTheme(
  theme: Theme,
  systemTheme: ResolvedTheme,
  disableTransitionOnChange: boolean,
) {
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const restoreTransitions = disableTransitionOnChange
    ? disableTransitions()
    : null;

  document.documentElement.classList.remove(...THEME_CLASSES);
  document.documentElement.classList.add(resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;

  restoreTransitions?.();
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = THEME_STORAGE_KEY,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() =>
    getStoredTheme(storageKey, defaultTheme),
  );
  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>(getSystemTheme);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = useCallback(
    (value: Theme | ((theme: Theme) => Theme)) => {
      setThemeState((currentTheme) => {
        const nextTheme =
          typeof value === "function" ? value(currentTheme) : value;

        try {
          localStorage.setItem(storageKey, nextTheme);
        } catch {}

        return nextTheme;
      });
    },
    [storageKey],
  );

  useEffect(() => {
    const media = window.matchMedia(SYSTEM_QUERY);
    const onChange = () =>
      setSystemTheme(media.matches ? "dark" : "light");

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      setThemeState(getStoredTheme(storageKey, defaultTheme));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    applyTheme(theme, systemTheme, disableTransitionOnChange);
  }, [theme, systemTheme, disableTransitionOnChange]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: enableSystem ? ["light", "dark", "system"] : ["light", "dark"],
    }),
    [theme, setTheme, resolvedTheme, systemTheme, enableSystem],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
