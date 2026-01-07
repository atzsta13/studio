export interface LineupItem {
  id: string;
  artist: string;
  stage: string;
  day: string;
  startTime: string;
  endTime: string;
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
}

export interface MapPin {
  id: string;
  label: string;
  type: 'stage' | 'water' | 'toilet' | 'first-aid' | 'camping';
  position: { top: string; left: string };
}
