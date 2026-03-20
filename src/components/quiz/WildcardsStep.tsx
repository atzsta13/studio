import { useHaptic } from '@/hooks/useHaptic';
import { QuizOptionCard } from './QuizOptionCard';

interface WildcardsStepProps {
  selected: boolean;
  onSelect: (wildcards: boolean) => void;
}

export function WildcardsStep({ selected, onSelect }: WildcardsStepProps) {
  const haptic = useHaptic();

  const handleSelect = (wildcards: boolean) => {
    haptic.mediumTap();
    onSelect(wildcards);
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Let's Spice It Up
        </h2>
        <p className="text-sm text-gray-400">
          Allow unexpected recommendations?
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuizOptionCard
          label="Surprise Me"
          emoji="🎲"
          description="Unlock hidden gems"
          selected={selected === true}
          onClick={() => handleSelect(true)}
        />
        <QuizOptionCard
          label="Keep It Safe"
          emoji="🛡️"
          description="Stick to my taste"
          selected={selected === false}
          onClick={() => handleSelect(false)}
        />
      </div>
    </div>
  );
}
