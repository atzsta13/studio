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
import { Map, CalendarDays, LifeBuoy, Music, Utensils, Wand2, ArrowRight, Sparkles, Gavel, Trophy } from 'lucide-react';
import { HydrationTracker } from '@/components/tools/hydration-tracker';

const features = [
  {
    title: 'Discover Artists',
    description: 'Lineup scouting & international acts',
    href: '/discover',
    icon: Wand2,
    color: '#ffee00', // Sziget Yellow
  },
  {
    title: 'Interactive Map',
    description: 'Navigate the island & find utilities',
    href: '/map',
    icon: Map,
    color: '#00c3ff', // Sziget Cyan
  },
  {
    title: 'Survival Toolkit',
    description: 'Converter, SOS & phrasebook',
    href: '/tools',
    icon: Gavel,
    color: '#4ade80', // Sziget Green
  },
  {
    title: 'Island Passport',
    description: 'Collect stamps & earn rewards',
    href: '/passport',
    icon: Trophy,
    color: '#e6007e', // Sziget Pink
  },
];

export default function Home() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 10, md: 16 },
        pb: { xs: 8, md: 12 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% -20%, rgba(230,0,126,0.2) 0%, transparent 60%)'
      }}>
        {/* Animated Background Element */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 20px)'
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: 'rgba(230,0,126,0.1)',
              mx: 'auto',
              mb: 4,
              border: '2px solid rgba(230,0,126,0.3)',
              boxShadow: '0 0 40px rgba(230,0,126,0.2)'
            }}
          >
            <Music size={48} color="#e6007e" />
          </Avatar>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              mb: 2,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontSize: { xs: '3.5rem', md: '5rem' },
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
              mb: 6,
              fontWeight: 500,
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Your unofficial, offline-first companion for the <span style={{ color: '#ffee00', fontWeight: 800 }}>Island of Freedom</span>. 
            Built to work deep in the crowd, no signal required.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
            <Link href="/discover" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                disableElevation
                endIcon={<ArrowRight size={20} />}
                sx={{
                  height: 64,
                  px: 6,
                  fontSize: '1.1rem',
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(230,0,126,0.3)',
                  background: 'linear-gradient(45deg, #e6007e, #ff0080)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 32px rgba(230,0,126,0.4)',
                  }
                }}
              >
                Start Scouting
              </Button>
            </Link>
          </Box>

          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <HydrationTracker />
          </Box>
        </Container>
      </Box>

      {/* Feature Grid Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.2em' }}>
            The Survival Toolkit
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Experience the Island
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid key={feature.title} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    borderColor: feature.color,
                    boxShadow: `0 20px 40px -10px ${feature.color}20`,
                    '& .icon-box': {
                      transform: 'scale(1.1) rotate(5deg)',
                      bgcolor: `${feature.color}30`,
                    }
                  }
                }}
              >
                <Link href={feature.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardActionArea sx={{ height: '100%', p: 1 }}>
                    <CardContent sx={{ textAlign: 'center', py: 6, px: 3 }}>
                      <Box
                        className="icon-box"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 5,
                          bgcolor: `${feature.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 4,
                          color: feature.color,
                          transition: 'all 0.3s ease',
                          boxShadow: `0 8px 16px -4px ${feature.color}30`
                        }}
                      >
                        <feature.icon size={40} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6, px: 2 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom Banner */}
        <Box sx={{ 
          mt: 12, 
          p: 6, 
          borderRadius: 8, 
          bgcolor: 'rgba(255,255,255,0.02)', 
          border: '1px dashed rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <Box sx={{ 
            p: 3, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,238,0,0.1)', 
            color: '#ffee00',
            boxShadow: '0 0 20px rgba(255,238,0,0.1)'
          }}>
            <Sparkles size={40} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', textTransform: 'uppercase', fontStyle: 'italic' }}>
              Official Lineup Updated
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, maxWidth: 600 }}>
              The 2026 artist roster is live! We've just synced the latest batch of 45+ standout features and hardware tools.
            </Typography>
          </Box>
          <Link href="/discover" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" sx={{ borderRadius: 3, px: 6, py: 1.5, borderColor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 900 }}>
              View All 80+ Acts
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
