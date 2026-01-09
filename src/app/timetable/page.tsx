'use client';

import { useState, useMemo } from 'react';
import TimetableView from '@/components/timetable/timetable-view';
import lineup2026 from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { History, Calendar } from 'lucide-react';
import { Box, Typography, Container, Button } from '@mui/material';

export default function TimetablePage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');

  const currentLineup = useMemo(() => {
    return activeYear === '2026' ? (lineup2026 as any) : (lineup2025 as any);
  }, [activeYear]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      <Box sx={{ pt: 6, pb: 4, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.05em',
              mb: 3,
              textTransform: 'uppercase',
              fontSize: { xs: '2.5rem', md: '4rem' }
            }}
          >
            TIMETABLE <span style={{ color: '#ff0080' }}>2026</span>
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Button
              onClick={() => setActiveYear('2026')}
              variant={activeYear === '2026' ? 'contained' : 'text'}
              startIcon={<Calendar size={18} />}
              sx={{
                borderRadius: 2,
                px: 3,
                bgcolor: activeYear === '2026' ? 'primary.main' : 'transparent',
                color: activeYear === '2026' ? '#fff' : 'rgba(255,255,255,0.4)',
                '&:hover': { bgcolor: activeYear === '2026' ? 'primary.dark' : 'rgba(255,255,255,0.05)' }
              }}
            >
              2026
            </Button>
            <Button
              onClick={() => setActiveYear('2025')}
              variant={activeYear === '2025' ? 'contained' : 'text'}
              startIcon={<History size={18} />}
              sx={{
                borderRadius: 2,
                px: 3,
                bgcolor: activeYear === '2025' ? 'primary.main' : 'transparent',
                color: activeYear === '2025' ? '#fff' : 'rgba(255,255,255,0.4)',
                '&:hover': { bgcolor: activeYear === '2025' ? 'primary.dark' : 'rgba(255,255,255,0.05)' }
              }}
            >
              2025
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ flex: 1 }}>
        <TimetableView key={activeYear} lineup={currentLineup} />
      </Box>
    </Box>
  );
}
