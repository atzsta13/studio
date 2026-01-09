'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material';
import { Icon } from '@/components/ui/icon';
import { navItems } from '@/config/nav';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeIndex = React.useMemo(() => {
    const idx = navItems.findIndex(item =>
      (item.href === '/' && pathname === '/') ||
      (item.href !== '/' && pathname.startsWith(item.href))
    );
    return idx === -1 ? 0 : idx;
  }, [pathname]);

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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#000',
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
            height: 64,
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '8px 0',
              color: 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 900,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                transform: 'translateY(-2px)',
              },
              '& .MuiBottomNavigationAction-iconWrapper': {
                transform: 'translateY(-2px)',
                filter: 'drop-shadow(0 0 8px rgba(255, 0, 128, 0.5))',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.6rem',
              fontWeight: 800,
              marginTop: '2px',
            }
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label.toUpperCase()} // Keep uppercase style for mobile
              icon={
                <Box className="MuiBottomNavigationAction-iconWrapper" sx={{ transition: 'all 0.3s ease' }}>
                  <Icon name={item.icon} size={20} />
                </Box>
              }
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
