import { useHaptic } from '@/hooks/useHaptic';
import { EnergyLevel } from '@/types';
import { QuizOptionCard } from './QuizOptionCard';

interface EnergyStepProps {
  selected: EnergyLevel | '';
  onSelect: (energy: EnergyLevel) => void;
}

export function EnergyStep({ selected, onSelect }: EnergyStepProps) {
  const haptic = useHaptic();

  const handleSelect = (energy: EnergyLevel) => {
    haptic.mediumTap();
    onSelect(energy);
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Energy Level
        </h2>
        <p className="text-sm text-gray-400">How intense do you want your experience?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuizOptionCard
          label="Chill"
          emoji="🧊"
          description="Relaxed vibes"
          selected={selected === 'CHILL'}
          onClick={() => handleSelect('CHILL')}
        />
        <QuizOptionCard
          label="Balanced"
          emoji="⚡"
          description="Mix of everything"
          selected={selected === 'BALANCED'}
          onClick={() => handleSelect('BALANCED')}
        />
        <QuizOptionCard
          label="Unhinged"
          emoji="🔥"
          description="All in, chaos"
          selected={selected === 'UNHINGED'}
          onClick={() => handleSelect('UNHINGED')}
        />
      </div>
    </div>
  );
}
