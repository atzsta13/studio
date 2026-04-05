export interface LineupItem {
  id: string;
  artist: string;
  stage?: string | null;
  day: string | null;
  startTime?: string | null;
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
  vibes?: string[];
  isHeadliner?: boolean;
  returningHero?: boolean;
  lastYearStage?: string;
}

export interface MapPin {
  id: string;
  label: string;
  type: 'stage' | 'water' | 'toilet' | 'first-aid' | 'camping';
  position: { top: string; left: string };
}

export interface VibeQuizState {
  step: number;
  energy: string;
  selectedGenres: Set<string>;
  crowdVibe: string;
  moodTag: string;
  wildcards: boolean;
  results?: LineupItem[];
}

export type EnergyLevel = 'CHILL' | 'BALANCED' | 'UNHINGED';
export type GenreOption = 'ELECTRONIC' | 'ROCK' | 'HIP-HOP' | 'INDIE' | 'TECHNO' | 'POP' | 'METAL' | 'EXPERIMENTAL';
export type CrowdVibeOption = 'DANCE_FLOOR' | 'MOSH_PIT' | 'FESTIVAL_FIELD' | 'INTIMATE_STAGE';
export type MoodTagOption = 'EUPHORIC' | 'DARK' | 'NOSTALGIC' | 'FRESH' | 'HARD';
