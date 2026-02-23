
'use client';

import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo, useEffect, useState } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { useTheme } from 'next-themes';

const getThemeOptions = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: '#ff0080',
      light: '#ff3399',
      dark: '#cc0066',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00f2ff',
      light: '#33f5ff',
      dark: '#00c2cc',
      contrastText: mode === 'dark' ? '#000000' : '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#000000' : '#ffffff',
      paper: mode === 'dark' ? '#0a0a0a' : '#f9f9f9',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.04em' },
    h2: { fontWeight: 900, letterSpacing: '-0.03em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    button: { fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    caption: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 800,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark' ? '0 0 20px rgba(255, 0, 128, 0.2)' : '0 4px 12px rgba(255, 0, 128, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default function MuiRegistry({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeMode = mounted ? (resolvedTheme as 'light' | 'dark') : 'dark';

  const muiTheme = useMemo(() => {
    let t = createTheme(getThemeOptions(themeMode));
    t = responsiveFontSizes(t);
    return t;
  }, [themeMode]);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
