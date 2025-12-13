import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

function ThemeScope({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`app-theme ${isDark ? 'dark' : ''}`}
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      {children}
    </div>
  );
}

export default function AuthedAppShell() {
  return (
    <ThemeProvider>
      <ThemeScope>
        <Outlet />
      </ThemeScope>
    </ThemeProvider>
  );
}
