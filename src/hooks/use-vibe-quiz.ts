import { useState, useCallback } from 'react';
import { LineupItem, EnergyLevel, GenreOption, CrowdVibeOption, MoodTagOption } from '@/types';

interface QuizState {
  step: number;
  energy: EnergyLevel | '';
  selectedGenres: Set<GenreOption>;
  crowdVibe: CrowdVibeOption | '';
  moodTag: MoodTagOption | '';
  wildcards: boolean;
}

export function useVibeQuiz(lineup: LineupItem[]) {
  const [state, setState] = useState<QuizState>({
    step: 0,
    energy: '',
    selectedGenres: new Set(),
    crowdVibe: '',
    moodTag: '',
    wildcards: false,
  });

  const [results, setResults] = useState<LineupItem[]>([]);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 4) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }));
  }, []);

  const setEnergy = useCallback((energy: EnergyLevel) => {
    setState((prev) => ({ ...prev, energy }));
  }, []);

  const toggleGenre = useCallback((genre: GenreOption) => {
    setState((prev) => {
      const newGenres = new Set(prev.selectedGenres);
      if (newGenres.has(genre)) {
        newGenres.delete(genre);
      } else {
        if (newGenres.size >= 2) return prev;
        newGenres.add(genre);
      }
      return { ...prev, selectedGenres: newGenres };
    });
  }, []);

  const setCrowdVibe = useCallback((crowdVibe: CrowdVibeOption) => {
    setState((prev) => ({ ...prev, crowdVibe }));
  }, []);

  const setMoodTag = useCallback((moodTag: MoodTagOption) => {
    setState((prev) => ({ ...prev, moodTag }));
  }, []);

  const setWildcards = useCallback((wildcards: boolean) => {
    setState((prev) => ({ ...prev, wildcards }));
  }, []);

  const computeResults = useCallback(() => {
    if (!state.energy || state.selectedGenres.size === 0 || !state.moodTag) {
      return;
    }

    const targetVibes = buildTargetVibes(state.energy, state.moodTag);

    const scored = lineup.map((artist) => {
      const genreScore =
        (artist.genres || []).filter((g) =>
          state.selectedGenres.has(g as GenreOption)
        ).length * 2;

      const vibeScore = (artist.vibes || []).filter((v) =>
        targetVibes.includes(v)
      ).length;

      // Headliners have stage + day assignments (when schedule data is available)
      // For now, we'll consider artists with vibes as quality signal
      const headlinerBonus = artist.vibes && artist.vibes.length > 0 ? 0.5 : 0;
      const noise = state.wildcards ? Math.random() : 0;

      const score = genreScore + vibeScore + headlinerBonus + noise;

      return { artist, score };
    });

    const filtered = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const topResults =
      filtered.length < 4
        ? scored.sort((a, b) => b.score - a.score).slice(0, 4)
        : filtered;

    setResults(topResults.map(({ artist }) => artist));
  }, [state, lineup]);

  const reset = useCallback(() => {
    setState({
      step: 0,
      energy: '',
      selectedGenres: new Set(),
      crowdVibe: '',
      moodTag: '',
      wildcards: false,
    });
    setResults([]);
  }, []);

  return {
    state,
    results,
    nextStep,
    prevStep,
    setEnergy,
    toggleGenre,
    setCrowdVibe,
    setMoodTag,
    setWildcards,
    computeResults,
    reset,
  };
}

function buildTargetVibes(
  energy: EnergyLevel,
  moodTag: MoodTagOption
): string[] {
  const energyVibes: Record<EnergyLevel, string[]> = {
    CHILL: ['Chill', 'Flow', 'Nostalgic'],
    BALANCED: ['Dance', 'Feel-good', 'Party'],
    UNHINGED: ['Hard', 'Rave', 'High Energy', 'Dance'],
  };

  const moodVibes: Record<MoodTagOption, string[]> = {
    EUPHORIC: ['Feel-good', 'Anthemic', 'Sing-along', 'Dance'],
    DARK: ['Hard', 'Rave', 'Weird'],
    NOSTALGIC: ['Nostalgic', 'Anthemic', 'Feel-good'],
    FRESH: ['Flow', 'Dance', 'Party'],
    HARD: ['Hard', 'High Energy', 'Rave'],
  };

  const combined = [
    ...energyVibes[energy],
    ...moodVibes[moodTag],
  ];

  return [...new Set(combined)];
}
