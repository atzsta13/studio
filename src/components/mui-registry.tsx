'use client';

import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo } from 'react';

const themeOptions = {
    palette: {
        mode: 'dark' as const,
        primary: {
            main: '#ff0080', // Sharp Neon Pink
            light: '#ff3399',
            dark: '#cc0066',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00f2ff', // Electric Cyan
            light: '#33f5ff',
            dark: '#00c2cc',
            contrastText: '#000000',
        },
        background: {
            default: '#000000', // Pure Black for AMOLED
            paper: '#0a0a0a',   // Just off-black
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.6)',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
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
                        boxShadow: '0 0 20px rgba(255, 0, 128, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
    },
};

export default function MuiRegistry({ children }: { children: ReactNode }) {
    const theme = useMemo(() => {
        let t = createTheme(themeOptions);
        t = responsiveFontSizes(t);
        return t;
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
