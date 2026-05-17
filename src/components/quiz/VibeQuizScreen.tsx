'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LineupItem } from '@/types';
import { useVibeQuiz } from '@/hooks/use-vibe-quiz';
import { useHaptic } from '@/hooks/use-haptic';
import { EnergyStep } from './EnergyStep';
import { GenreStep } from './GenreStep';
import { CrowdVibeStep } from './CrowdVibeStep';
import { MoodTagStep } from './MoodTagStep';
import { WildcardsStep } from './WildcardsStep';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VibeQuizScreenProps {
  lineup: LineupItem[];
  onComplete: (results: LineupItem[]) => void;
}

const STEPS = [
  { label: 'Energy', color: 'from-yellow-400' },
  { label: 'Genres', color: 'from-magenta-500' },
  { label: 'Crowd', color: 'from-cyan-400' },
  { label: 'Mood', color: 'from-green-400' },
  { label: 'Spice', color: 'from-red-400' },
];

export function VibeQuizScreen({ lineup, onComplete }: VibeQuizScreenProps) {
  const haptic = useHaptic();
  const {
    state,
    results,
    setEnergy,
    toggleGenre,
    setCrowdVibe,
    setMoodTag,
    setWildcards,
    nextStep,
    prevStep,
    computeResults,
    reset,
  } = useVibeQuiz(lineup);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (results.length > 0 && showResults) {
      onComplete(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, showResults]);

  const canProceed = () => {
    switch (state.step) {
      case 0:
        return state.energy !== '';
      case 1:
        return state.selectedGenres.size > 0;
      case 2:
        return state.crowdVibe !== '';
      case 3:
        return state.moodTag !== '';
      case 4:
        return state.wildcards !== null;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    haptic.successBurst();
    computeResults();
    setShowResults(true);
  };

  const handleRetake = () => {
    setShowResults(false);
    reset();
  };

  const handlePrevStep = () => {
    haptic.lightTap();
    prevStep();
  };

  const handleNextStep = () => {
    haptic.mediumTap();
    nextStep();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/discover" className="p-2 hover:bg-card rounded-lg transition">
            <ChevronLeft className="w-6 h-6 text-accent" />
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-wider">VIBE DNA</h1>
          <div className="w-10" />
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-12">
          {STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => {
                haptic.lightTap();
                if (i < state.step) prevStep();
                while (state.step < i) nextStep();
              }}
              className={`flex-1 h-2 rounded-full transition-all ${
                i <= state.step ? 'bg-primary' : 'bg-card'
              }`}
              disabled={showResults}
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8 min-h-96">
          {!showResults ? (
            <>
              {state.step === 0 && (
                <EnergyStep selected={state.energy as any} onSelect={setEnergy} />
              )}
              {state.step === 1 && (
                <GenreStep
                  selected={state.selectedGenres}
                  onToggle={toggleGenre}
                />
              )}
              {state.step === 2 && (
                <CrowdVibeStep
                  selected={state.crowdVibe as any}
                  onSelect={setCrowdVibe}
                />
              )}
              {state.step === 3 && (
                <MoodTagStep
                  selected={state.moodTag as any}
                  onSelect={setMoodTag}
                />
              )}
              {state.step === 4 && (
                <WildcardsStep
                  selected={state.wildcards}
                  onSelect={setWildcards}
                />
              )}
            </>
          ) : null}
        </div>

        {/* Navigation */}
        {!showResults && (
          <div className="flex gap-4">
            {state.step > 0 && (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <div className="flex-1" />
            {state.step < 4 ? (
              <button
                onClick={handleNextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  canProceed()
                    ? 'bg-accent text-black hover:bg-accent/80 cursor-pointer'
                    : 'bg-card text-muted-foreground cursor-not-allowed border border-border'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all uppercase tracking-wide ${
                  canProceed()
                    ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                    : 'bg-card text-muted-foreground cursor-not-allowed border border-border'
                }`}
              >
                Find Artists
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
