// scripts/vibe-taxonomy.mjs
/**
 * Single source of truth for Genre -> Vibe mappings.
 * All festivals share this taxonomy to ensure consistent AI behavior.
 */
export const VIBE_TAXONOMY = {
  // ── Electronic ──────────────────────────────────────────────────────────
  TECHNO:          ['Dance', 'Hard', 'Rave', 'Dark'],
  HOUSE:           ['Dance', 'Feel-Good', 'Uplifting'],
  TRANCE:          ['Dance', 'Uplifting', 'Euphoric'],
  DRUM_AND_BASS:   ['Dance', 'Fast', 'Energetic', 'Dark'],
  AMBIENT:         ['Chill', 'Atmospheric', 'Introspective'],
  EDM:             ['Dance', 'Uplifting', 'Mainstream'],
  TRAP:            ['Urban', 'Hype', 'Bass'],
  FUTURE_BASS:     ['Uplifting', 'Melodic', 'Dance'],
  HYPERPOP:        ['Eclectic', 'Intense', 'Energetic'],
  DNB:             ['Dance', 'Fast', 'Energetic', 'Bass'],
  DRUM_BASS:       ['Dance', 'Fast', 'Energetic', 'Bass'],
  DUBSTEP:         ['Bass', 'Heavy', 'Intense'],
  BASS_MUSIC:      ['Bass', 'Hype', 'Electronic'],
  JUNGLE:          ['Dance', 'Fast', 'Rhythmic', 'Raw'],
  GRIME:           ['Urban', 'Aggressive', 'Rhythmic'],
  GARAGE:          ['Dance', 'Rhythmic', 'Urban'],
  UK_CLUB:         ['Dance', 'Electronic', 'Rhythmic'],
  DELTA_DISTRICT:  ['Dance', 'Electronic', 'Rave'],

  // ── Rock / Guitar ────────────────────────────────────────────────────────
  ROCK:            ['Raw', 'Energetic', 'Guitar'],
  INDIE:           ['Chill', 'Atmospheric', 'Melodic'],
  PUNK:            ['Raw', 'Aggressive', 'Fast'],
  ALTERNATIVE:     ['Raw', 'Eclectic', 'Guitar'],
  GRUNGE:          ['Raw', 'Heavy', 'Atmospheric'],
  EMOCORE:         ['Emotional', 'Intense', 'Guitar'],

  // ── Metal ────────────────────────────────────────────────────────────────
  METAL:           ['Heavy', 'Energetic', 'Intense'],
  HEAVY_METAL:     ['Heavy', 'Energetic', 'Intense'],
  DEATH_METAL:     ['Brutal', 'Dark', 'Intense', 'Heavy'],
  BLACK_METAL:     ['Dark', 'Atmospheric', 'Intense', 'Raw'],
  THRASH_METAL:    ['Aggressive', 'Fast', 'Raw', 'Energetic'],
  POWER_METAL:     ['Epic', 'Anthemic', 'Melodic', 'Fast'],
  GOTHIC_METAL:    ['Dark', 'Atmospheric', 'Haunting', 'Emotional'],
  DOOM_METAL:      ['Heavy', 'Slow', 'Dark', 'Crushing'],
  PROGRESSIVE_METAL: ['Complex', 'Melodic', 'Technical', 'Atmospheric'],
  SYMPHONIC_METAL: ['Epic', 'Orchestral', 'Dramatic', 'Melodic'],
  GROOVE_METAL:    ['Heavy', 'Rhythmic', 'Aggressive', 'Energetic'],
  METALCORE:       ['Aggressive', 'Melodic', 'Intense', 'Heavy'],
  FOLK_METAL:      ['Energetic', 'Cultural', 'Melodic', 'Fun'],
  SPEED_METAL:     ['Fast', 'Aggressive', 'Energetic', 'Raw'],
  HARDCORE:        ['Aggressive', 'Raw', 'Intense', 'Fast'],
  STONER_METAL:    ['Heavy', 'Slow', 'Hazy', 'Riff-driven'],

  // ── Pop ──────────────────────────────────────────────────────────────────
  POP:             ['Feel-Good', 'Uplifting', 'Mainstream'],
  INDIE_POP:       ['Melodic', 'Chill', 'Feel-Good'],
  DREAM_POP:       ['Atmospheric', 'Chill', 'Introspective'],
  HYPERPOP_POP:    ['Eclectic', 'Energetic', 'Experimental'],
  SINGER_SONGWRITER: ['Emotional', 'Acoustic', 'Intimate'],

  // ── Hip-Hop / R&B ────────────────────────────────────────────────────────
  HIP_HOP:         ['Urban', 'Hype', 'Rhythmic'],
  RAP:             ['Urban', 'Rhythmic', 'Lyrically Dense'],
  RNB:             ['Soulful', 'Smooth', 'Groove'],
  AFROBEATS:       ['Dance', 'Cultural', 'Groove'],

  // ── World / Folk ─────────────────────────────────────────────────────────
  WORLD_MUSIC:     ['Eclectic', 'Cultural', 'Laid-Back'],
  FOLK:            ['Acoustic', 'Emotional', 'Storytelling'],
  REGGAE:          ['Laid-Back', 'Feel-Good', 'Groove'],
  FLAMENCO:        ['Cultural', 'Acoustic', 'Passionate'],

  // ── Jazz / Blues / Soul ──────────────────────────────────────────────────
  JAZZ:            ['Chill', 'Sophisticated', 'Improvisational'],
  BLUES:           ['Emotional', 'Acoustic', 'Raw'],
  SOUL:            ['Soulful', 'Emotional', 'Groove'],
  FUNK:            ['Groove', 'Dance', 'Feel-Good'],

  // ── Classical / Experimental ─────────────────────────────────────────────
  CLASSICAL:       ['Sophisticated', 'Dramatic', 'Emotional'],
  EXPERIMENTAL:    ['Eclectic', 'Unusual', 'Challenging'],
  NOISE:           ['Intense', 'Aggressive', 'Experimental'],
};
