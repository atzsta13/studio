'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material';
import { Icon } from '@/components/ui/icon';
import { navItems } from '@/config/nav';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeIndex = React.useMemo(() => {
    const idx = navItems.findIndex(item =>
      (item.href === '/' && pathname === '/') ||
      (item.href !== '/' && pathname.startsWith(item.href))
    );
    return idx === -1 ? 0 : idx;
  }, [pathname]);

  if (!mounted) return null;

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: 'background.default',
          backdropFilter: 'blur(40px)',
          backgroundImage: 'none',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation
          showLabels
          value={activeIndex}
          onChange={(_, newValue) => {
            router.push(navItems[newValue].href);
          }}
          sx={{
            height: 72,
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '12px 0',
              color: 'text.secondary',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 900,
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                transform: 'translateY(-4px)',
              },
              '& .MuiBottomNavigationAction-iconWrapper': {
                transform: 'translateY(-4px) scale(1.1)',
                filter: 'drop-shadow(0 0 12px rgba(255, 0, 128, 0.4))',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.55rem',
              fontWeight: 800,
              marginTop: '4px',
              textTransform: 'uppercase',
            }
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={
                <Box className="MuiBottomNavigationAction-iconWrapper" sx={{ transition: 'all 0.3s ease' }}>
                  <Icon name={item.icon} size={22} />
                </Box>
              }
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
