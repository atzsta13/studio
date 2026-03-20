import { CrowdVibeOption } from '@/types';
import { QuizOptionCard } from './QuizOptionCard';

interface CrowdVibeStepProps {
  selected: CrowdVibeOption | '';
  onSelect: (vibe: CrowdVibeOption) => void;
}

export function CrowdVibeStep({ selected, onSelect }: CrowdVibeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Crowd Energy
        </h2>
        <p className="text-sm text-gray-400">What's your ideal crowd scenario?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuizOptionCard
          label="Dance Floor"
          emoji="💃"
          description="Rhythmic and synchronized"
          selected={selected === 'DANCE_FLOOR'}
          onClick={() => onSelect('DANCE_FLOOR')}
        />
        <QuizOptionCard
          label="Mosh Pit"
          emoji="👊"
          description="Raw energy, uncontrolled"
          selected={selected === 'MOSH_PIT'}
          onClick={() => onSelect('MOSH_PIT')}
        />
        <QuizOptionCard
          label="Festival Field"
          emoji="🌾"
          description="Spread out, vibing together"
          selected={selected === 'FESTIVAL_FIELD'}
          onClick={() => onSelect('FESTIVAL_FIELD')}
        />
        <QuizOptionCard
          label="Intimate Stage"
          emoji="🎤"
          description="Close, personal connection"
          selected={selected === 'INTIMATE_STAGE'}
          onClick={() => onSelect('INTIMATE_STAGE')}
        />
      </div>
    </div>
  );
}
