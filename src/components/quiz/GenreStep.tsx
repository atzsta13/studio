import { useHaptic } from '@/hooks/useHaptic';
import { GenreOption } from '@/types';
import { QuizOptionCard } from './QuizOptionCard';

interface GenreStepProps {
  selected: Set<GenreOption>;
  onToggle: (genre: GenreOption) => void;
}

const GENRES: { genre: GenreOption; emoji: string; label: string }[] = [
  { genre: 'ELECTRONIC', emoji: '🎹', label: 'Electronic' },
  { genre: 'ROCK', emoji: '🎸', label: 'Rock' },
  { genre: 'HIP-HOP', emoji: '🎤', label: 'Hip-Hop' },
  { genre: 'INDIE', emoji: '🎵', label: 'Indie' },
  { genre: 'TECHNO', emoji: '⚙️', label: 'Techno' },
  { genre: 'POP', emoji: '🌟', label: 'Pop' },
  { genre: 'METAL', emoji: '🤘', label: 'Metal' },
  { genre: 'EXPERIMENTAL', emoji: '👽', label: 'Experimental' },
];

export function GenreStep({ selected, onToggle }: GenreStepProps) {
  const haptic = useHaptic();

  const handleToggle = (genre: GenreOption) => {
    haptic.mediumTap();
    onToggle(genre);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Your Sound
        </h2>
        <p className="text-sm text-gray-400">
          Pick up to 2 genres ({selected.size}/2)
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GENRES.map(({ genre, emoji, label }) => (
          <QuizOptionCard
            key={genre}
            label={label}
            emoji={emoji}
            selected={selected.has(genre)}
            onClick={() => handleToggle(genre)}
          />
        ))}
      </div>
    </div>
  );
}
