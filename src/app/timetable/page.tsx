'use client';

import { useState, useMemo, useEffect } from 'react';
import TimetableView from '@/components/timetable/timetable-view';
import lineupCurrent from '@/data/lineup.json';
import { History, Calendar, Clock } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useTheme, alpha } from '@mui/material/styles';
import { FESTIVAL } from '@/config/festival';

export default function TimetablePage() {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLineup = useMemo(() => {
    return (lineupCurrent as any[]);
  }, []);

  const hasSchedule = useMemo(() => {
    return currentLineup.some(item => item.startTime && item.endTime && item.day && item.stage);
  }, [currentLineup]);

  if (!mounted) return null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ 
        pt: 12, 
        pb: 8, 
        textAlign: 'center', 
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(to bottom, ${alpha(FESTIVAL.theme.primaryHex, 0.05)}, transparent)` 
          : `linear-gradient(to bottom, ${alpha(FESTIVAL.theme.primaryHex, 0.02)}, #f8f8f8)`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.07em',
              mb: 2,
              textTransform: 'uppercase',
              fontSize: { xs: '3.5rem', md: '6.5rem' },
              fontStyle: 'italic',
              lineHeight: 0.85
            }}
          >
            TIMETABLE <span style={{ color: FESTIVAL.theme.primaryHex }}>{FESTIVAL.dates.year}</span>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              opacity: 0.5,
              fontSize: '0.75rem',
              mb: 4
            }}
          >
            Official Stage Times
          </Typography>
        </Container>
      </Box>

      <Box sx={{ flex: 1, position: 'relative' }}>
        {hasSchedule ? (
          <TimetableView lineup={currentLineup} />
        ) : (
          <Container maxWidth="sm" sx={{ py: 20, textAlign: 'center' }}>
            <Box sx={{ 
              mx: 'auto', 
              mb: 4, 
              width: 80, 
              height: 80, 
              borderRadius: '2rem', 
              bgcolor: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Clock size={40} color={FESTIVAL.theme.primaryHex} style={{ opacity: 0.5 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 2 }}>
              Announcing Soon
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, opacity: 0.7 }}>
              The official stage times for {FESTIVAL.name} {FESTIVAL.dates.year} have not been published yet. 
              Check back closer to the festival dates.
            </Typography>
            <Button
              component={Link}
              href="/discover"
              variant="outlined"
              sx={{ 
                mt: 6, 
                borderRadius: '1rem', 
                px: 4, 
                height: '3.5rem', 
                fontWeight: 900, 
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: FESTIVAL.theme.primaryHex,
                  bgcolor: alpha(FESTIVAL.theme.primaryHex, 0.05)
                }
              }}
            >
              BROWSE ARTISTS
            </Button>
          </Container>
        )}
      </Box>
    </Box>
  );
}

// Adding Link import since I used it in the button
import Link from 'next/link';
