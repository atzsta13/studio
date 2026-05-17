/**
 * Single artist entry from lineup.json.
 * IMPORTANT: stage, startTime, endTime are null until Sziget publishes the 2026 schedule.
 * Never build UI that assumes these fields exist.
 * vibes is 100% populated across all festivals and safe to use for filtering/AI.
 */
export interface LineupItem {
  id: string;
  artist: string;
  /** null until schedule published */
  stage?: string | null;
  /** null until schedule published */
  day: string | null;
  /** null until schedule published */
  startTime?: string | null;
  /** null until schedule published */
  endTime?: string | null;
  countryCode?: string;
  genres?: string[];
  festivalUrl?: string;
  imageUrl?: string;
  socials?: {
    spotify?: string;
    appleMusic?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
    tiktok?: string;
    soundcloud?: string;
  };
  description?: string;
  /** Mood/energy tags — 100% populated, primary signal for AI recommendations */
  vibes?: string[];
  isHeadliner?: boolean;
  returningHero?: boolean;
  lastYearStage?: string;
}

/** POI dot on the festival map. position is % from top-left of the map image. */
export interface MapPin {
  id: string;
  label: string;
  type: 'stage' | 'water' | 'toilet' | 'first-aid' | 'camping';
  position: { top: string; left: string };
}

/** Transient UI state for the 5-step Vibe Quiz — not persisted. */
export interface VibeQuizState {
  step: number;
  energy: string;
  selectedGenres: Set<string>;
  crowdVibe: string;
  moodTag: string;
  wildcards: boolean;
  results?: LineupItem[];
}

/** Step 1 of the Vibe Quiz */
export type EnergyLevel = 'CHILL' | 'BALANCED' | 'UNHINGED';
/** Step 2 of the Vibe Quiz — max 2 selectable */
export type GenreOption = 'ELECTRONIC' | 'ROCK' | 'HIP-HOP' | 'INDIE' | 'TECHNO' | 'POP' | 'METAL' | 'EXPERIMENTAL' | 'AMBIENT' | 'JAZZ';
/** Step 3 of the Vibe Quiz */
export type CrowdVibeOption = 'DANCE_FLOOR' | 'MOSH_PIT' | 'FESTIVAL_FIELD' | 'INTIMATE_STAGE';
/** Step 4 of the Vibe Quiz */
export type MoodTagOption = 'EUPHORIC' | 'DARK' | 'NOSTALGIC' | 'FRESH' | 'HARD';
