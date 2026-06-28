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
  festivalId: string;
  isFavorite: boolean;
  isConflicting: boolean;
  onToggleFavorite: () => void;
}

export default function ArtistCard({ artist, festivalId, isFavorite, isConflicting, onToggleFavorite }: ArtistCardProps) {
  if (!artist.startTime || !artist.endTime) return null;

  const start = new Date(artist.startTime);
  const startTime = format(start, 'HH:mm');
  const duration = (new Date(artist.endTime).getTime() - start.getTime()) / (1000 * 60);

  const isTiny = duration < 25;
  const isSmall = duration < 40;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '1px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSmall ? 'center' : 'space-between',
        p: isTiny ? 0.5 : 1.5,
        borderRadius: '0.75rem',
        bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.1)' : FESTIVAL.theme.backgroundHex,
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: isConflicting ? '4px solid #ef4444' : isFavorite ? `4px solid ${FESTIVAL.theme.primaryHex}` : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        boxShadow: isConflicting ? '0 10px 30px rgba(239, 68, 68, 0.2)' : isFavorite ? `0 10px 30px ${FESTIVAL.theme.glowColor}` : 'none',
        '&:hover': {
          bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.2)' : FESTIVAL.theme.backgroundHex,
          borderColor: isConflicting ? '#ef4444' : isFavorite ? FESTIVAL.theme.primaryHex : 'rgba(255,255,255,0.2)',
          zIndex: 50,
          transform: 'scale(1.02)'
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: isTiny ? 'center' : 'flex-start', gap: 0.5 }}>
        <Link
          href={`/${festivalId}/artist/${artist.id}`}
          style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          <Typography
            sx={{
              color: isConflicting ? '#ef4444' : '#fff',
              fontWeight: 900,
              fontSize: isTiny ? '0.7rem' : isSmall ? '0.8rem' : '1rem',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              '&:hover': { color: FESTIVAL.theme.primaryHex }
            }}
          >
            {artist.artist}
          </Typography>
          {!isTiny && (
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
          )}
        </Link>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
          <Box
            onClick={onToggleFavorite}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', p: 0.25 }}
          >
            {isFavorite
              ? <Heart size={isTiny ? 12 : 16} fill={FESTIVAL.theme.primaryHex} color={FESTIVAL.theme.primaryHex} />
              : !isTiny && <Heart size={14} color="rgba(255,255,255,0.15)" style={{ display: 'block' }} />
            }
          </Box>
          {!isSmall && (
            <Link href={`/map?stage=${encodeURIComponent(artist.stage || "")}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
              <IconButton size="small" aria-label="View on map" sx={{ p: 0.5, color: 'rgba(255,255,255,0.2)', '&:hover': { color: FESTIVAL.theme.secondaryHex } }}>
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
