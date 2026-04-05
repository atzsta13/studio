import { useHaptic } from '@/hooks/use-haptic';
import { MoodTagOption } from '@/types';
import { QuizOptionCard } from './QuizOptionCard';

interface MoodTagStepProps {
  selected: MoodTagOption | '';
  onSelect: (mood: MoodTagOption) => void;
}

export function MoodTagStep({ selected, onSelect }: MoodTagStepProps) {
  const haptic = useHaptic();

  const handleSelect = (mood: MoodTagOption) => {
    haptic.mediumTap();
    onSelect(mood);
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Your Mood
        </h2>
        <p className="text-sm text-gray-400">What's your emotional vibe?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-5">
        <QuizOptionCard
          label="Euphoric"
          emoji="😍"
          selected={selected === 'EUPHORIC'}
          onClick={() => handleSelect('EUPHORIC')}
        />
        <QuizOptionCard
          label="Dark"
          emoji="🌑"
          selected={selected === 'DARK'}
          onClick={() => handleSelect('DARK')}
        />
        <QuizOptionCard
          label="Nostalgic"
          emoji="📼"
          selected={selected === 'NOSTALGIC'}
          onClick={() => handleSelect('NOSTALGIC')}
        />
        <QuizOptionCard
          label="Fresh"
          emoji="🌊"
          selected={selected === 'FRESH'}
          onClick={() => handleSelect('FRESH')}
        />
        <QuizOptionCard
          label="Hard"
          emoji="⚔️"
          selected={selected === 'HARD'}
          onClick={() => handleSelect('HARD')}
        />
      </div>
    </div>
  );
}
