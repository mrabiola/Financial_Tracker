import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';

export default function AuthedAppShell() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
