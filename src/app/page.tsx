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
  Grid
} from '@mui/material';
import { Map, CalendarDays, LifeBuoy, Music, Utensils, Wand2, ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Full Schedule',
    description: 'Plan your festival day by day',
    href: '/schedule',
    icon: CalendarDays,
    color: '#e6007e',
  },
  {
    title: 'Interactive Map',
    description: 'Find your way around the island',
    href: '/map',
    icon: Map,
    color: '#00c3ff',
  },
  {
    title: 'Discover Artists',
    description: 'AI-powered recommendations',
    href: '/discover',
    icon: Wand2,
    color: '#ffee00',
  },
  {
    title: 'Survival Guide',
    description: 'Essential tips and info',
    href: '/guide',
    icon: LifeBuoy,
    color: '#4ade80',
  },
];

export default function Home() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 8 },
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% -20%, rgba(230,0,126,0.15) 0%, transparent 50%)'
      }}>
        <Container maxWidth="md">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(230,0,126,0.1)',
              mx: 'auto',
              mb: 3,
              border: '1px solid rgba(230,0,126,0.2)'
            }}
          >
            <Music size={40} color="#e6007e" />
          </Avatar>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 2,
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            Sziget <span style={{ color: '#e6007e' }}>Insider</span> 2026
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              fontWeight: 500,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            The unofficial offline-first companion for the <span style={{ borderBottom: '2px solid #ffee00', paddingBottom: 2 }}>Island of Freedom</span>. All features work deep in the crowd without a signal.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Link href="/schedule" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                disableElevation
                endIcon={<ArrowRight size={20} />}
                sx={{
                  height: 56,
                  px: 4,
                  fontSize: '1rem',
                  boxShadow: '0 8px 16px rgba(230,0,126,0.2)'
                }}
              >
                Start Exploring
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Feature Grid - M3 Cards */}
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: feature.color,
                  }
                }}
                variant="outlined"
              >
                <Link href={feature.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardActionArea sx={{ height: '100%', p: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 4,
                          bgcolor: `${feature.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          color: feature.color
                        }}
                      >
                        <feature.icon size={28} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
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
      </Container>
    </Box>
  );
}
