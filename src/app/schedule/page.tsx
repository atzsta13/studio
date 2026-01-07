import ScheduleView from '@/components/schedule/schedule-view';
import lineup from '@/data/lineup.json';
import type { LineupItem } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'The full lineup and schedule for Sziget 2026. Plan your festival experience.',
};

export default function SchedulePage() {
  const typedLineup: LineupItem[] = lineup as LineupItem[];

  return (
    <div className="flex h-full flex-col">
      <header className="container sticky top-0 z-30 bg-background/95 py-4 backdrop-blur-sm md:top-16">
        <h1 className="text-center font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Festival Schedule
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Tap the heart to favorite an artist. We'll warn you about any clashes!
        </p>
      </header>
      <div className="flex-1">
        <ScheduleView lineup={typedLineup} />
      </div>
    </div>
  );
}
