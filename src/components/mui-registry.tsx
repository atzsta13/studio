'use client';

import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo, useEffect, useState } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { useTheme } from 'next-themes';
import { FESTIVAL } from '@/config/festival';

const getThemeOptions = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: FESTIVAL.theme.primaryHex,
      contrastText: '#ffffff',
    },
    secondary: {
      main: FESTIVAL.theme.secondaryHex,
      contrastText: mode === 'dark' ? '#000000' : '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#000000' : '#ffffff',
      paper: mode === 'dark' ? '#050505' : '#fcfcfc',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: '"Outfit", "Varela Round", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.05em' },
    h2: { fontWeight: 900, letterSpacing: '-0.04em' },
    h3: { fontWeight: 900, letterSpacing: '-0.03em' },
    h4: { fontWeight: 900, letterSpacing: '-0.02em' },
    button: { fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.15em' },
    caption: { fontWeight: 700, letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 28px',
          fontWeight: 900,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: FESTIVAL.theme.glowColor ? `0 0 30px ${FESTIVAL.theme.glowColor}` : 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default function MuiRegistry({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
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
