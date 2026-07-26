import type { ReactNode } from 'react';

type Tone = 'default' | 'danger';
type Size = 'md' | 'sm';

interface PillButtonProps {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
    tone?: Tone;
    size?: Size;
    /** Struck through and faded — used for a stage the user has hidden. */
    muted?: boolean;
    title?: string;
    'aria-label'?: string;
}

const SIZES: Record<Size, string> = {
    md: 'px-3 py-1.5 text-[10px] tracking-widest border-2',
    sm: 'px-2.5 py-1 text-[9px] tracking-wider border',
};

/**
 * The timetable's one pill control: day tabs, NOW, GRID/LIST, FAV, FIT and the
 * stage filters. Every variation lived as its own copy of the same long class
 * string before, which is how they drifted apart.
 */
export default function PillButton({
    children,
    onClick,
    active = false,
    tone = 'default',
    size = 'md',
    muted = false,
    title,
    'aria-label': ariaLabel,
}: PillButtonProps) {
    const state = muted
        ? 'border-border/30 text-muted-foreground/40 bg-transparent line-through'
        : tone === 'danger'
            ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
            : active
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/30';

    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={ariaLabel}
            className={`flex items-center gap-1 rounded-full font-black uppercase transition-all whitespace-nowrap ${SIZES[size]} ${state}`}
        >
            {children}
        </button>
    );
}
