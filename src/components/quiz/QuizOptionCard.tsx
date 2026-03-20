import { cn } from '@/lib/utils';

interface QuizOptionCardProps {
  label: string;
  emoji?: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function QuizOptionCard({
  label,
  emoji,
  description,
  selected,
  onClick,
}: QuizOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
        'hover:scale-105 active:scale-95',
        selected
          ? 'border-[#FFED4E] bg-[#1a1a1a] text-white'
          : 'border-[#333333] bg-[#0a0a0a] text-gray-400 hover:border-[#FFED4E]'
      )}
    >
      {emoji && <span className="text-3xl">{emoji}</span>}
      <span className="font-semibold text-sm uppercase tracking-wide">{label}</span>
      {description && (
        <span className="text-xs text-gray-500 text-center">{description}</span>
      )}
    </button>
  );
}
