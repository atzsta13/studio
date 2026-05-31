'use client';
import { useInsider } from '@/components/layout/insider-provider';

import { useState } from 'react';
import type { LineupItem } from '@/types';
import { VibeQuizScreen } from '@/components/quiz/VibeQuizScreen';
import { VibeResultsScreen } from '@/components/quiz/VibeResultsScreen';

export default function VibeQuizPage() {
  const [results, setResults] = useState<LineupItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { lineup } = useInsider();
  const { toggleFavorite } = useInsider();

  const handleComplete = (quizResults: LineupItem[]) => {
    setResults(quizResults);
    setShowResults(true);
  };

  const handleFavorite = (artistId: string) => {
    toggleFavorite(artistId, 'interested');
  };

  const handleSaveAll = (artistIds: string[]) => {
    artistIds.forEach((id) => {
      toggleFavorite(id, 'interested');
    });
  };

  const handleRetake = () => {
    setShowResults(false);
    setResults([]);
  };

  if (showResults) {
    return (
      <VibeResultsScreen
        results={results}
        onRetake={handleRetake}
        onFavorite={handleFavorite}
        onSaveAll={handleSaveAll}
      />
    );
  }

  return (
    <VibeQuizScreen
      lineup={lineup}
      onComplete={handleComplete}
    />
  );
}
