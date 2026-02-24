'use client';

import { useState, useMemo } from 'react';
import TimetableView from '@/components/timetable/timetable-view';
import lineup2026 from '@/data/lineup.json';
import lineup2025 from '@/data/lineup_2025.json';
import { History, Calendar } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

export default function TimetablePage() {
  const [activeYear, setActiveYear] = useState<'2025' | '2026'>('2026');

  const currentLineup = useMemo(() => {
    return activeYear === '2026' ? (lineup2026 as any) : (lineup2025 as any);
  }, [activeYear]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      <Box sx={{ pt: 8, pb: 6, textAlign: 'center', background: 'linear-gradient(to bottom, #0a0a0a, #000)' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.07em',
              mb: 4,
              textTransform: 'uppercase',
              fontSize: { xs: '3.5rem', md: '6rem' },
              fontStyle: 'italic',
              lineHeight: 0.9
            }}
          >
            TIMETABLE <span style={{ color: '#ff0080' }}>{activeYear}</span>
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              onClick={() => setActiveYear('2026')}
              variant={activeYear === '2026' ? 'contained' : 'outlined'}
              startIcon={<Calendar size={20} />}
              sx={{
                borderRadius: '1.25rem',
                px: 4,
                height: '3.5rem',
                fontWeight: 900,
                letterSpacing: '0.2em',
                bgcolor: activeYear === '2026' ? 'primary.main' : 'transparent',
                borderColor: activeYear === '2026' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': { 
                  bgcolor: activeYear === '2026' ? 'primary.dark' : 'rgba(255,255,255,0.05)',
                  borderColor: 'primary.main'
                }
              }}
            >
              2026
            </Button>
            <Button
              onClick={() => setActiveYear('2025')}
              variant={activeYear === '2025' ? 'contained' : 'outlined'}
              startIcon={<History size={20} />}
              sx={{
                borderRadius: '1.25rem',
                px: 4,
                height: '3.5rem',
                fontWeight: 900,
                letterSpacing: '0.2em',
                bgcolor: activeYear === '2025' ? 'primary.main' : 'transparent',
                borderColor: activeYear === '2025' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': { 
                  bgcolor: activeYear === '2025' ? 'primary.dark' : 'rgba(255,255,255,0.05)',
                  borderColor: 'primary.main'
                }
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
