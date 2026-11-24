import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  applyThemePreference,
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "./theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const initial = readThemePreference();
    applyThemePreference(initial);
    return initial;
  });

  const setPreference = useCallback((next: ThemePreference) => {
    applyThemePreference(next);
    saveThemePreference(next);
    setPreferenceState(next);
  }, []);

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme は ThemeProvider の内側で使ってください");
  }
  return context;
}
