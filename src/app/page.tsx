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
  ChevronRight,
  Zap,
  LayoutGrid
} from 'lucide-react';
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
    icon: Zap,
    color: '#4ade80',
  },
  {
    title: 'Passport',
    description: 'Collect Island Stamps',
    href: '/passport',
    icon: Trophy,
    color: '#ff0080',
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const nowPlaying = useMemo(() => {
    return (lineup as any[]).filter(a => a.day === 'Wednesday').slice(0, 3);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12, overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(circle at 50% -20%, rgba(255,0,128,0.15) 0%, transparent 60%)'
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '2rem', 
              bgcolor: 'rgba(255,0,128,0.05)', 
              border: '1px solid rgba(255,0,128,0.1)',
              boxShadow: '0 20px 40px rgba(255,0,128,0.1)'
            }}>
              <Music size={40} color="#ff0080" />
            </Box>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 2,
              letterSpacing: '-0.06em',
              lineHeight: 0.85,
              fontSize: { xs: '4.5rem', md: '8rem' },
              textTransform: 'uppercase',
              fontStyle: 'italic',
              textShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            Sziget <span style={{ color: '#ff0080' }}>Insider</span>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 6,
              fontWeight: 600,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.2,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              opacity: 0.8
            }}
          >
            Ultimate intelligence for the <span style={{ color: '#ffee00', fontWeight: 900 }}>Island of Freedom</span>. 
          </Typography>

          <Container maxWidth="sm">
            <Paper sx={{ 
              p: 4, 
              bgcolor: 'rgba(255, 255, 255, 0.02)', 
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '2.5rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Newspaper size={18} color="#ff0080" />
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Island Status
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.4rem', fontStyle: 'italic' }}>
                Vibe: Electric. Dust: High.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.95rem', fontWeight: 500 }}>
                Colosseum peak at 02:00. All water points active. Reapply sunscreen; UV index is peaking.
              </Typography>
            </Paper>
          </Container>
        </Container>
      </Box>

      {/* Now Playing Pulse Widget */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 10 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{ 
            width: 14, 
            height: 14, 
            borderRadius: '50%', 
            bgcolor: '#ff0080', 
            boxShadow: '0 0 20px #ff0080',
            animation: 'pulse 1.5s infinite' 
          }} />
          <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
            Island Pulse: <span style={{ opacity: 0.3 }}>Now Playing</span>
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {nowPlaying.map((artist, idx) => (
            <Grid item key={artist.id} xs={12} md={4}>
              <Card sx={{ 
                bgcolor: 'rgba(255,255,255,0.03)', 
                borderRadius: '2rem', 
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  borderColor: 'primary.main',
                  boxShadow: '0 20px 40px rgba(255,0,128,0.1)'
                }
              }}>
                <CardActionArea href={`/artist/${artist.id}`}>
                  <Box sx={{ p: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '1.5rem', 
                      backgroundImage: `url(${artist.imageUrl})`, 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                    }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem', fontStyle: 'italic' }}>{artist.artist}</Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, textTransform: 'uppercase', display: 'block', letterSpacing: '0.1em' }}>
                        {artist.stage || 'Main Stage'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                        Set: {idx * 15 + 10}m elapsed
                      </Typography>
                    </Box>
                    <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Control Operations */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.4em', mb: 1, display: 'block' }}>
              Mission Control
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
              Operations
            </Typography>
          </Box>
          <Link href="/timetable" style={{ textDecoration: 'none' }}>
            <Button 
              size="large" 
              endIcon={<LayoutGrid size={18} />} 
              sx={{ 
                borderRadius: '1rem', 
                bgcolor: 'rgba(255,255,255,0.05)', 
                color: 'text.primary',
                px: 4
              }}
            >
              Grid View
            </Button>
          </Link>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid key={feature.title} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  backgroundImage: 'none',
                  borderRadius: '2.5rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    borderColor: feature.color,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    boxShadow: `0 40px 80px -15px ${feature.color}30`,
                  }
                }}
              >
                <Link href={feature.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '2rem',
                          bgcolor: `${feature.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          color: feature.color,
                          boxShadow: `0 10px 20px ${feature.color}15`
                        }}
                      >
                        <feature.icon size={32} strokeWidth={2.5} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase', fontSize: '1.1rem', fontStyle: 'italic' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tactical Tactical Sections */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: 'rgba(255,238,0,0.02)', 
              border: '1px dashed rgba(255,238,0,0.2)', 
              borderRadius: '3rem',
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: 'rgba(255,238,0,0.05)' }
            }}>
              <CardActionArea href="/memories" sx={{ p: 0 }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: 'rgba(255,238,0,0.1)', 
                    color: '#ffee00', 
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 20px rgba(255,238,0,0.1)'
                  }}>
                    <Camera size={32} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem', fontStyle: 'italic' }}>Memory Log</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}>Capture the magic. Private & Offline.</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              bgcolor: 'rgba(255,0,128,0.02)', 
              border: '1px dashed rgba(255,0,128,0.2)', 
              borderRadius: '3rem',
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: 'rgba(255,0,128,0.05)' }
            }}>
              <CardActionArea href="/quests" sx={{ p: 0 }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: 'rgba(255,0,128,0.1)', 
                    color: '#ff0080', 
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 20px rgba(255,0,128,0.1)'
                  }}>
                    <Flame size={32} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem', fontStyle: 'italic' }}>Island Quests</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}>Earn Legend XP and unlock Stamps.</Typography>
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
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(255,0,128,0.4); }
          50% { opacity: 0.6; transform: scale(1.2); box-shadow: 0 0 20px rgba(255,0,128,0.6); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 rgba(255,0,128,0.4); }
        }
      `}</style>
    </Box>
  );
}
