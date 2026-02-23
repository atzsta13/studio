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
  useTheme,
  Button,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import { 
  Map, 
  Wand2, 
  ArrowRight, 
  Sparkles, 
  Gavel, 
  Trophy, 
  Music, 
  Camera, 
  Zap, 
  Newspaper,
  Sun,
  Flame
} from 'lucide-react';
import { HydrationTracker } from '@/components/tools/hydration-tracker';
import { useEffect, useState } from 'react';

const features = [
  {
    title: 'Discover Artists',
    description: 'Lineup scouting & AI matching',
    href: '/discover',
    icon: Wand2,
    color: '#ffee00',
  },
  {
    title: 'Interactive Map',
    description: 'Find utilities & vibe peaks',
    href: '/map',
    icon: Map,
    color: '#00c3ff',
  },
  {
    title: 'Survival Toolkit',
    description: 'SOS, HUF Converter & Phrasebook',
    href: '/tools',
    icon: Gavel,
    color: '#4ade80',
  },
  {
    title: 'Island Passport',
    description: 'Collect stamps & earn rewards',
    href: '/passport',
    icon: Trophy,
    color: '#e6007e',
  },
];

export default function Home() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% -20%, rgba(230,0,126,0.15) 0%, transparent 60%)'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(230,0,126,0.1)',
              mx: 'auto',
              mb: 3,
              border: '2px solid rgba(230,0,126,0.3)',
              boxShadow: '0 0 40px rgba(230,0,126,0.2)'
            }}
          >
            <Music size={40} color="#e6007e" />
          </Avatar>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 1,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontSize: { xs: '3rem', md: '5rem' },
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
              mb: 4,
              fontWeight: 500,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.4,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Ultimate offline-first companion for the <span style={{ color: '#ffee00', fontWeight: 800 }}>Island of Freedom</span>. 
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
            <Link href="/discover" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                disableElevation
                endIcon={<ArrowRight size={20} />}
                sx={{
                  height: 56,
                  px: 4,
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(230,0,126,0.3)',
                  background: 'linear-gradient(45deg, #e6007e, #ff0080)',
                }}
              >
                Start Scouting
              </Button>
            </Link>
          </Box>

          <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
            <Grid item xs={12} sm={6}>
              <HydrationTracker />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Feature 1: AI Daily Newsfeed (Island Morning Report) */}
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'rgba(79, 70, 229, 0.1)', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: 4,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Newspaper size={18} className="text-indigo-500" />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'indigo.500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Island Status
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Dust Level: High. Vibe: Electric.
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Secret Colosseum set rumored for 02:00. Stay hydrated near Main Stage.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Grid Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.2em' }}>
            Mission Control
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, textTransform: 'uppercase' }}>
            Explore the Island
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid key={feature.title} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  borderRadius: 5,
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: feature.color,
                    boxShadow: `0 20px 40px -10px ${feature.color}20`,
                  }
                }}
              >
                <Link href={feature.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 4,
                          bgcolor: `${feature.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          color: feature.color,
                        }}
                      >
                        <feature.icon size={32} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase', fontSize: '1rem' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Context Cards */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(255,238,0,0.05)', border: '1px dashed rgba(255,238,0,0.2)', borderRadius: 6 }}>
              <CardActionArea href="/memories">
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,238,0,0.1)', color: '#ffee00', borderRadius: '50%' }}>
                    <Camera size={32} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>Digital Memory Log</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Document your best festival moments. Purely local & private.</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(74, 222, 128, 0.05)', border: '1px dashed rgba(74, 222, 128, 0.2)', borderRadius: 6 }}>
              <CardActionArea href="/quests">
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '50%' }}>
                    <Flame size={32} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>Daily Quests</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>3 active challenges today. Earn XP and Island Lore.</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
