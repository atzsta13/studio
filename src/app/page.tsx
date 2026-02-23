'use client';

import Link from 'next/link';
import {
  Box,
  Typography,
  Container,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { 
  Map as MapIcon, 
  Wand2, 
  Gavel, 
  Trophy, 
  Music, 
  Camera, 
  Newspaper,
  Flame,
  ChevronRight
} from 'lucide-react';
import { HydrationTracker } from '@/components/tools/hydration-tracker';
import { useEffect, useState, useMemo } from 'react';
import lineup from '@/data/lineup.json';

const features = [
  {
    title: 'Discovery',
    description: 'AI Scouting & Lineup',
    href: '/discover',
    icon: Wand2,
    color: '#ffee00',
  },
  {
    title: 'Tactical Map',
    description: 'Find Water & Vibes',
    href: '/map',
    icon: MapIcon,
    color: '#00c3ff',
  },
  {
    title: 'Toolkit',
    description: 'SOS & Survival Gear',
    href: '/tools',
    icon: Gavel,
    color: '#4ade80',
  },
  {
    title: 'Passport',
    description: 'Collect Island Stamps',
    href: '/passport',
    icon: Trophy,
    color: '#e6007e',
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const nowPlaying = useMemo(() => {
    // Simulated "Now Playing" for the Island Pulse feature
    return (lineup as any[]).filter(a => a.day === 'Wednesday').slice(0, 3);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 6, md: 10 },
        pb: { xs: 6, md: 8 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% -20%, rgba(230,0,126,0.1) 0%, transparent 70%)'
      }}>
        <Container maxWidth="md">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(230,0,126,0.05)',
              mx: 'auto',
              mb: 3,
              border: '1px solid rgba(230,0,126,0.2)',
              boxShadow: '0 0 30px rgba(230,0,126,0.1)'
            }}
          >
            <Music size={32} color="#e6007e" />
          </Avatar>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 1,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              fontSize: { xs: '3.5rem', md: '6.5rem' },
              textTransform: 'uppercase',
              fontStyle: 'italic'
            }}
          >
            Sziget <span style={{ color: '#e6007e' }}>Insider</span>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 5,
              fontWeight: 500,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.4,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            The ultimate intelligence layer for the <span style={{ color: '#ffee00', fontWeight: 800 }}>Island of Freedom</span>. 
          </Typography>

          <Grid container spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
            <Grid item xs={12} sm={6}>
              <HydrationTracker />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'rgba(79, 70, 229, 0.05)', 
                border: '1px solid rgba(79, 70, 229, 0.15)',
                borderRadius: 6,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Newspaper size={16} className="text-indigo-500" />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'indigo.500', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Island Status
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.1rem' }}>
                  Vibe: Electric. Dust: High.
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  Colosseum peak expected at 02:00. <br/>All 12 water points are active and 100% free.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Now Playing Live Widget */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff0080', animation: 'pulse 2s infinite' }} />
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
            Island Pulse: <span style={{ opacity: 0.5 }}>Now Playing</span>
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {nowPlaying.map((artist, idx) => (
            <Grid item key={artist.id} xs={12} md={4}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden' }}>
                <CardActionArea href={`/artist/${artist.id}`}>
                  <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 3, 
                      bgcolor: 'muted.main', 
                      backgroundImage: `url(${artist.imageUrl})`, 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem' }}>{artist.artist}</Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                        {artist.stage || 'Main Stage'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Started {idx * 15 + 10}m ago
                      </Typography>
                    </Box>
                    <ChevronRight size={16} />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Operations Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.3em' }}>
              Mission Control
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
              Operations
            </Typography>
          </Box>
          <Link href="/timetable" style={{ textDecoration: 'none' }}>
            <Button size="small" endIcon={<ChevronRight size={14} />} sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Full Schedule
            </Button>
          </Link>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: feature.color,
                    boxShadow: `0 30px 60px -12px ${feature.color}20`,
                  }
                }}
              >
                <Link href={feature.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '1.25rem',
                          bgcolor: `${feature.color}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2.5,
                          color: feature.color,
                        }}
                      >
                        <feature.icon size={28} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tactical Row */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,238,0,0.03)', border: '1px dashed rgba(255,238,0,0.15)', borderRadius: 7 }}>
              <CardActionArea href="/memories" sx={{ p: 0 }}>
                <CardContent sx={{ p: 3.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,238,0,0.08)', color: '#ffee00', borderRadius: '1.25rem' }}>
                    <Camera size={28} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem' }}>Memory Log</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Capture the magic. 100% Private & Offline diary.</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(74, 222, 128, 0.03)', border: '1px dashed rgba(74, 222, 128, 0.15)', borderRadius: 7 }}>
              <CardActionArea href="/quests" sx={{ p: 0 }}>
                <CardContent sx={{ p: 3.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(74, 222, 128, 0.08)', color: '#4ade80', borderRadius: '1.25rem' }}>
                    <Flame size={28} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem' }}>Island Quests</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Explore the island. Earn Legend XP and Stamps.</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}
