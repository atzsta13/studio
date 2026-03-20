export interface LineupItem {
  id: string;
  artist: string;
  stage?: string;
  day: string;
  startTime?: string;
  endTime?: string;
  countryCode?: string;
  genres?: string[];
  szigetUrl?: string;
  imageUrl?: string;
  socials?: {
    spotify?: string;
    appleMusic?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
    website?: string;
    tiktok?: string;
  };
  description?: string;
  vibes?: string[];
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
