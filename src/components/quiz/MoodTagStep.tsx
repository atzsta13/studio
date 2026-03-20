import { MoodTagOption } from '@/types';
import { QuizOptionCard } from './QuizOptionCard';

interface MoodTagStepProps {
  selected: MoodTagOption | '';
  onSelect: (mood: MoodTagOption) => void;
}

export function MoodTagStep({ selected, onSelect }: MoodTagStepProps) {
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
          onClick={() => onSelect('EUPHORIC')}
        />
        <QuizOptionCard
          label="Dark"
          emoji="🌑"
          selected={selected === 'DARK'}
          onClick={() => onSelect('DARK')}
        />
        <QuizOptionCard
          label="Nostalgic"
          emoji="📼"
          selected={selected === 'NOSTALGIC'}
          onClick={() => onSelect('NOSTALGIC')}
        />
        <QuizOptionCard
          label="Fresh"
          emoji="🌊"
          selected={selected === 'FRESH'}
          onClick={() => onSelect('FRESH')}
        />
        <QuizOptionCard
          label="Hard"
          emoji="⚔️"
          selected={selected === 'HARD'}
          onClick={() => onSelect('HARD')}
        />
      </div>
    </div>
  );
}
