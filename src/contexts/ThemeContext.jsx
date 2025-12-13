import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const THEME_SESSION_KEY = 'authed_theme'; // 'light' | 'dark'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = sessionStorage.getItem(THEME_SESSION_KEY);
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      return;
    }

    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    sessionStorage.setItem(THEME_SESSION_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
