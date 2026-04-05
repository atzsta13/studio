import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { LineupItem } from '@/types';
import Link from 'next/link';
import { FESTIVAL } from '@/config/festival-engine';

interface ArtistCardProps {
  artist: LineupItem;
  isFavorite: boolean;
  isConflicting: boolean;
  onToggleFavorite: () => void;
}

export default function ArtistCard({ artist, isFavorite, isConflicting, onToggleFavorite }: ArtistCardProps) {
  if (!artist.startTime || !artist.endTime) return null;

  const start = new Date(artist.startTime);
  const startTime = format(start, 'HH:mm');
  const duration = (new Date(artist.endTime).getTime() - start.getTime()) / (1000 * 60);

  const isSmall = duration < 40;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '1px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSmall ? 'center' : 'space-between',
        p: 1.5,
        borderRadius: '0.75rem',
        bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.1)' : '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: isConflicting ? '4px solid #ef4444' : isFavorite ? `4px solid ${FESTIVAL.theme.primaryHex}` : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        boxShadow: isConflicting ? '0 10px 30px rgba(239, 68, 68, 0.2)' : isFavorite ? `0 10px 30px ${FESTIVAL.theme.glowColor}` : 'none',
        '&:hover': {
          bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.2)' : '#141414',
          borderColor: isConflicting ? '#ef4444' : isFavorite ? FESTIVAL.theme.primaryHex : 'rgba(255,255,255,0.2)',
          zIndex: 50,
          transform: 'scale(1.02)'
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box
          onClick={onToggleFavorite}
          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
        >
          <Typography
            sx={{
              color: isConflicting ? '#ef4444' : '#fff',
              fontWeight: 900,
              fontSize: isSmall ? '0.8rem' : '1rem',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              fontStyle: 'italic'
            }}
          >
            {artist.artist}
          </Typography>
          <Typography
            sx={{
              color: isConflicting ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255,255,255,0.4)',
              fontSize: '0.7rem',
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              mt: 0.5,
              letterSpacing: '0.05em'
            }}
          >
            {startTime} {isConflicting && "(!)"}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {isFavorite && (
            <Heart size={16} fill={FESTIVAL.theme.primaryHex} color={FESTIVAL.theme.primaryHex} style={{ marginTop: 2 }} />
          )}
          {!isSmall && (
            <Link href={`/map?stage=${encodeURIComponent(artist.stage || "")}`} style={{ textDecoration: 'none' }}>
              <IconButton size="small" sx={{ p: 0.5, color: 'rgba(255,255,255,0.2)', '&:hover': { color: FESTIVAL.theme.secondaryHex } }}>
                <MapPin size={14} />
              </IconButton>
            </Link>
          )}
        </Box>
      </Box>

      {!isSmall && artist.genres?.[0] && (
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 900,
            color: isFavorite ? FESTIVAL.theme.primaryHex : FESTIVAL.theme.secondaryHex,
            letterSpacing: '0.2em',
            mt: 'auto',
            opacity: 0.8
          }}
        >
          {artist.genres[0].toUpperCase()}
        </Typography>
      )}
    </Box>
  );
}
