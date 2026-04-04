'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Map as MapIcon,
  Wand2,
  Trophy,
  Music,
  Camera,
  Newspaper,
  Flame,
  ChevronRight,
  Zap,
  LayoutGrid,
  Utensils
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useFestivalData } from '@/hooks/use-festival-data';
import { useState, useEffect, useMemo } from 'react';
import type { LineupItem } from '@/types';
import { FestivalCountdown } from '@/components/home/festival-countdown';
import { NewsBulletin } from '@/components/home/news-bulletin';
import { FanPoll } from '@/components/home/fan-poll';
import { PhotoWall } from '@/components/home/photo-wall';

export default function Home() {
  const { festivalId } = useParams() as { festivalId: string };
  const { config, lineup, isLoading } = useFestivalData(festivalId);
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const allFeatures = useMemo(() => [
    {
      title: 'Discovery',
      description: 'AI Scouting & Lineup',
      href: `/${festivalId}/discover`,
      icon: Wand2,
      color: config.theme.accentHex,
      feature: 'vibeQuiz'
    },
    {
      title: 'Tactical Map',
      description: 'Find Water & Vibes',
      href: `/${festivalId}/map`,
      icon: MapIcon,
      color: config.theme.secondaryHex,
      feature: 'weatherRadar'
    },
    {
      title: 'Toolkit',
      description: 'SOS & Survival Gear',
      href: `/${festivalId}/tools`,
      icon: Zap,
      color: '#4ade80',
    },
  ], [festivalId, config]);

  const features = useMemo(() => 
    allFeatures.filter(f => !f.feature || (config.features as any)[f.feature]),
    [allFeatures, config]
  );

  const openingActs = useMemo(() => {
    return (lineup as LineupItem[]).filter(a => a.day === config.dates.openingDayFilter).slice(0, 3);
  }, [lineup, config]);

  if (!mounted || isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={48} className="animate-pulse text-primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12, overflowX: 'hidden' }}>
      {/* Cinematic Hero */}
      <Box sx={{
        pt: { xs: 10, md: 16 },
        pb: { xs: 8, md: 12 },
        textAlign: 'center',
        position: 'relative',
        background: theme.palette.mode === 'dark'
          ? `radial-gradient(circle at 50% -20%, ${alpha(config.theme.primaryHex, 0.12)} 0%, transparent 70%)`
          : `radial-gradient(circle at 50% -20%, ${alpha(config.theme.primaryHex, 0.05)} 0%, transparent 70%)`
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Box sx={{
              p: 2.5,
              borderRadius: '2.5rem',
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.05)}`
            }}>
              <Music size={44} color={config.theme.primaryHex} strokeWidth={2.5} />
            </Box>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 3,
              letterSpacing: '-0.07em',
              lineHeight: 0.8,
              fontSize: { xs: '5rem', md: '9rem' },
              textTransform: 'uppercase',
              fontStyle: 'italic',
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
            }}
          >
            {config.name} <span style={{ color: config.theme.primaryHex }}>Insider</span>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 8,
              fontWeight: 600,
              maxWidth: 640,
              mx: 'auto',
              lineHeight: 1.1,
              fontSize: { xs: '1.2rem', md: '1.75rem' },
              opacity: 0.7,
              letterSpacing: '-0.02em'
            }}
          >
            Elite intelligence for the <span style={{ color: config.theme.accentHex, fontWeight: 900, textShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(0,0,0,0.1)' : 'none' }}>{config.tagline}</span>.
          </Typography>

          <Container maxWidth="sm">
            <Paper sx={{
              p: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.01),
              backdropFilter: 'blur(60px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: '3rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: theme.palette.mode === 'dark' ? '0 40px 80px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.05)',
              transition: 'all 0.5s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Newspaper size={20} color={config.theme.primaryHex} />
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.7rem' }}>
                  Festival Dates
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.6rem', fontStyle: 'italic', lineHeight: 1 }}>
                {config.dates.startDate} – {config.dates.endDate}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '1rem', fontWeight: 500, opacity: 0.8 }}>
                {config.location.venue} · {config.location.city}
              </Typography>
            </Paper>
          </Container>
        </Container>
      </Box>

      {/* Festival Countdown */}
      <Container maxWidth="sm" sx={{ mt: -2, mb: 8 }}>
        <FestivalCountdown festivalId={festivalId} />
      </Container>

      {/* Now Playing Pulse Widget */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 12 }}>
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: config.theme.primaryHex,
            boxShadow: `0 0 30px ${config.theme.primaryHex}`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.04em', fontSize: '2.5rem' }}>
            {config.dates.days[0]} <span style={{ opacity: 0.2 }}>Opening Acts</span>
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {openingActs.map((artist) => (
            <Grid key={artist.id} size={{ xs: 12, md: 4 }}>
              <Card sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.02),
                borderRadius: '2.5rem',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'scale(1.03) translateY(-8px)',
                  borderColor: 'primary.main',
                  boxShadow: `0 30px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.04)
                }
              }}>
                <CardActionArea component={Link} href={`/${festivalId}/artist/${artist.id}`}>
                  <Box sx={{ p: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '2rem',
                      backgroundImage: `url(${artist.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem', fontStyle: 'italic', mb: 0.5, letterSpacing: '-0.02em' }}>{artist.artist}</Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, textTransform: 'uppercase', display: 'block', letterSpacing: '0.15em', mb: 0.5 }}>
                        {artist.genres?.[0] ?? 'Live'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem', opacity: 0.6 }}>
                        {artist.countryCode}
                      </Typography>
                    </Box>
                    <ChevronRight size={24} color="rgba(255,255,255,0.15)" />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Control Operations */}
      <Container maxWidth="lg" sx={{ mt: 16 }}>
        <Grid container spacing={12}>
          <Grid size={{ xs: 12, md: 7 }}>
            {config.features.newsBulletin && <NewsBulletin festivalId={festivalId} />}
            {config.features.fanPolls && <FanPoll festivalId={festivalId} />}
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.5em', mb: 1.5, display: 'block', fontSize: '0.75rem' }}>
                Mission Control
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', fontSize: '3.5rem', letterSpacing: '-0.05em', mb: 6 }}>
                Operations
              </Typography>
              
              <Grid container spacing={3}>
                {features.map((feature) => (
                  <Grid key={feature.title} size={{ xs: 6 }}>
                     <Card
                        sx={{
                          height: '100%',
                          bgcolor: alpha(theme.palette.background.paper, 0.01),
                          backgroundImage: 'none',
                          borderRadius: '2.5rem',
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          transition: 'all 0.5s ease',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: feature.color,
                            bgcolor: alpha(theme.palette.background.paper, 0.03),
                            transform: 'translateY(-8px)'
                          }
                        }}
                      >
                        <CardActionArea component={Link} href={feature.href} sx={{ height: '100%', p: 4 }}>
                            <Box sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '1.5rem',
                              bgcolor: alpha(feature.color, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              color: feature.color
                            }}>
                              <feature.icon size={28} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5, textTransform: 'uppercase', fontSize: '1rem', fontStyle: 'italic' }}>
                              {feature.title}
                            </Typography>
                        </CardActionArea>
                      </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {config.features.photoWall && <PhotoWall festivalId={festivalId} />}

        {/* Strategic Tactical Sections */}
        {config.features.foodRatings && (
          <Grid container spacing={4} sx={{ mt: 6, justifyContent: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{
                bgcolor: alpha('#4ade80', 0.01),
                border: `1px dashed ${alpha('#4ade80', 0.15)}`,
                borderRadius: '3.5rem',
                transition: 'all 0.4s ease',
                '&:hover': {
                  bgcolor: alpha('#4ade80', 0.03),
                  borderColor: '#4ade80'
                }
              }}>
                <CardActionArea component={Link} href={`/${festivalId}/food`} sx={{ p: 0 }}>
                  <CardContent sx={{ p: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Box sx={{
                      p: 3,
                      bgcolor: alpha('#4ade80', 0.08),
                      color: '#4ade80',
                      borderRadius: '2rem',
                      boxShadow: '0 15px 30px rgba(74,222,128,0.05)'
                    }}>
                      <Utensils size={40} strokeWidth={2.5} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem', fontStyle: 'italic', mb: 0.5 }}>Food Finder</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '1rem', opacity: 0.6 }}>Filter for the best budget meals.</Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(255,0,128,0.4); }
          50% { opacity: 0.4; transform: scale(1.15); box-shadow: 0 0 40px rgba(255,0,128,0.6); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(255,0,128,0.4); }
        }
      `}</style>
    </Box>
  );
}
