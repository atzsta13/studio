'use client';
import { useInsider } from '@/components/layout/insider-provider';

import { useState, useMemo, useEffect } from 'react';
import TimetableView from '@/components/timetable/timetable-view';
import { Clock, Sun, Moon } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useTheme, alpha } from '@mui/material/styles';
import { getFestivalConfig } from '@/config/festival-engine';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ClashResolver } from '@/components/timetable/clash-resolver';
import type { LineupItem } from '@/types';

export default function TimetablePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'daypark' | 'nightpark'>('daypark');
  const theme = useTheme();
  const { festivalId } = useParams() as { festivalId: string };
  const config = getFestivalConfig(festivalId);
  const { lineup: festivalLineup } = useInsider();
  const { allFavoriteIds } = useInsider();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLineup = useMemo(() => {
    if (config.features.dayparkNightpark) {
      return festivalLineup.filter((a: LineupItem & { timeSlot?: string }) => a.timeSlot === selectedTimeSlot);
    }
    return festivalLineup;
  }, [festivalLineup, selectedTimeSlot, config.features.dayparkNightpark]);


  const hasSchedule = useMemo(() => {
    return currentLineup.some(item => item.startTime && item.endTime && item.day && item.stage);
  }, [currentLineup]);

  if (!mounted) return null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{
        pt: { xs: 9, md: 10 },
        pb: 2,
        textAlign: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(to bottom, ${alpha(config.theme.primaryHex, 0.05)}, transparent)`
          : `linear-gradient(to bottom, ${alpha(config.theme.primaryHex, 0.02)}, #f8f8f8)`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontStyle: 'italic',
              lineHeight: 1
            }}
          >
            TIMETABLE <span style={{ color: config.theme.primaryHex }}>{config.dates.year}</span>
          </Typography>

          {/* Daypark / Nightpark Toggle (Frequency) */}
          {config.features.dayparkNightpark && (
            <Box sx={{
              display: 'inline-flex',
              p: 0.5,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(255,255,255,0.05)',
              mt: 2
            }}>
              <Button
                onClick={() => setSelectedTimeSlot('daypark')}
                sx={{
                  borderRadius: '1rem',
                  px: 4,
                  height: '3rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  bgcolor: selectedTimeSlot === 'daypark' ? 'primary.main' : 'transparent',
                  color: selectedTimeSlot === 'daypark' ? '#fff' : 'text.secondary',
                  '&:hover': { bgcolor: selectedTimeSlot === 'daypark' ? 'primary.dark' : 'rgba(255,255,255,0.05)' }
                }}
                startIcon={<Sun size={18} />}
              >
                DAYPARK
              </Button>
              <Button
                onClick={() => setSelectedTimeSlot('nightpark')}
                sx={{
                  borderRadius: '1rem',
                  px: 4,
                  height: '3rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  bgcolor: selectedTimeSlot === 'nightpark' ? config.theme.accentHex : 'transparent',
                  color: selectedTimeSlot === 'nightpark' ? '#000' : 'text.secondary',
                  '&:hover': { bgcolor: selectedTimeSlot === 'nightpark' ? config.theme.accentHex : 'rgba(255,255,255,0.05)', opacity: 0.9 }
                }}
                startIcon={<Moon size={18} />}
              >
                NIGHTPARK
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
           {config.features.clashResolver && (
             <ClashResolver favorites={festivalLineup.filter(a => allFavoriteIds.has(a.id))} />
           )}
        </Container>

        {hasSchedule ? (
          <TimetableView key={selectedTimeSlot} lineup={currentLineup} />
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
              <Clock size={40} color={config.theme.primaryHex} style={{ opacity: 0.5 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 2 }}>
              {config.features.dayparkNightpark ? `${selectedTimeSlot.toUpperCase()} PENDING` : 'Announcing Soon'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, opacity: 0.7 }}>
              The official stage times for {config.name} {selectedTimeSlot} have not been published yet. 
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
                  borderColor: config.theme.primaryHex,
                  bgcolor: alpha(config.theme.primaryHex, 0.05)
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
