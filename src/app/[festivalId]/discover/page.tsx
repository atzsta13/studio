'use client';

import { useState, useMemo, useEffect } from 'react';
import type { LineupItem } from '@/types';
import {
  Music,
  Search,
  Calendar,
  SortAsc,
  Sparkles,
  Globe,
  Wand2,
  Loader2,
  ChevronRight,
  Heart,
  AlertTriangle,
  X,
  LayoutGrid,
  Shuffle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SpotifyConnect } from '@/components/spotify/spotify-connect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { recommendArtists, type RecommendOutput } from '@/ai/flows/recommend-artists-flow';
import { useFavorites } from '@/hooks/use-favorites';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlaylistBuilder } from '@/components/spotify/playlist-builder';
import { SerendipityModal } from '@/components/discover/SerendipityModal';
import { TagCloud } from '@/components/discover/tag-cloud';
import { GenreBreakdown } from '@/components/discover/genre-breakdown';
import { VibeOfTheHour } from '@/components/discover/vibe-of-the-hour';
import { getRandomUnfavoritedArtist } from '@/lib/serendipity';
import { useHaptic } from '@/hooks/use-haptic';
import { useFestivalData } from '@/hooks/use-festival-data';
import { NotificationBanner } from '@/components/layout/notification-banner';

type ViewMode = 'discover' | 'az' | 'by-day' | 'by-country' | 'spotify' | 'ai';

export default function DiscoverPage() {
  const { festivalId } = useParams() as { festivalId: string };
  const { config, lineup, isLoading: isDataLoading } = useFestivalData(festivalId);
  const haptic = useHaptic();
  
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyMatches, setSpotifyMatches] = useState<string[]>([]);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [serendipityArtist, setSerendipityArtist] = useState<LineupItem | null>(null);
  const [serendipityHistory, setSerendipityHistory] = useState<Set<string>>(new Set());

  const allArtistsCurrent = useMemo(() => {
    return (lineup as LineupItem[]).map(a => ({
      ...a,
      vibes: a.vibes ?? [],
      returningHero: !!a.returningHero,
    }));
  }, [lineup]);

  const { favorites, allFavoriteIds, mustSeeIds, interestedIds, toggleFavorite, isFavorite, conflicts } = useFavorites(allArtistsCurrent, festivalId);
  const router = useRouter();
  
  const HIDDEN_GEM_IDS = config?.content?.hiddenGems || [];
  const SEEN_KEY = config ? `${config.id}-seen` : 'seen';
  
  const loadSeenIds = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(SEEN_KEY) : null;
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
    return new Set<string>();
  };

  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSeenIds(loadSeenIds());
  }, []);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RecommendOutput | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const getFlagEmoji = (countryCode: string | undefined) => {
    if (!countryCode || countryCode === 'Unknown') return '';
    const trimmedCode = countryCode.trim().toUpperCase();
    const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
    try {
      const codePoints = code
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return '';
    }
  };

  const DAY_ORDER = config.dates.days;

  const allArtists = allArtistsCurrent;

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allArtists.forEach(item => item.genres?.forEach(g => {
      if (g !== 'MUSIC') genres.add(g);
    }));
    return Array.from(genres).sort();
  }, [allArtists]);

  const allVibeSet = useMemo(() => {
    const vibes = new Set<string>();
    allArtists.forEach(item => item.vibes?.forEach(v => vibes.add(v)));
    return Array.from(vibes).sort();
  }, [allArtists]);

  const allStages = useMemo(() => {
    const stages = new Set<string>();
    allArtists.forEach(item => {
      if (item.stage) stages.add(item.stage);
    });
    return Array.from(stages).sort();
  }, [allArtists]);

  const filteredArtists = useMemo(() => {
    let base = [...allArtists];

    if (viewMode === 'ai' && aiResult) {
      const ids = aiResult.recommendations.map(r => r.artistId);
      base = base.filter(a => ids.includes(a.id));
    } else if (viewMode === 'spotify') {
      base = base.filter(a => spotifyMatches.includes(a.id));
    }

    if (viewMode === 'az') {
      base.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (viewMode === 'discover') {
      base.sort((a, b) => (b.isHeadliner ? 1 : 0) - (a.isHeadliner ? 1 : 0));
    }

    return base.filter(artist => {
      const matchesGenre = !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesVibe = !selectedVibe || artist.vibes?.includes(selectedVibe);
      const matchesStage = !selectedStage || (() => {
        const focus = config.content.radarFocuses?.find(f => f.id === selectedStage);
        if (focus) {
          return (
            (focus.targetStages && focus.targetStages.some(s => artist.stage?.toLowerCase().includes(s.toLowerCase()))) ||
            (focus.targetGenres && focus.targetGenres.some(g => artist.genres?.some(ag => ag.toLowerCase().includes(g.toLowerCase()))))
          );
        }
        return artist.stage === selectedStage;
      })();
      const matchesSearch = !searchQuery ||
        artist.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        artist.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGenre && matchesVibe && matchesStage && matchesSearch;
    });
  }, [allArtists, selectedGenre, selectedVibe, selectedStage, viewMode, aiResult, spotifyMatches, searchQuery, config]);

  const artistsByDay = useMemo(() => {
    const grouped: Record<string, typeof filteredArtists> = {};
    filteredArtists.forEach(a => {
      const day = a.day || 'Day TBD';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(a);
    });
    return grouped;
  }, [filteredArtists]);

  const artistsByCountry = useMemo(() => {
    const grouped: Record<string, typeof filteredArtists> = {};
    filteredArtists.forEach(a => {
      const country = a.countryCode || 'Unknown';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(a);
    });
    return grouped;
  }, [filteredArtists]);

  const handleSurpriseMe = () => {
    haptic.successBurst();
    const artist = getRandomUnfavoritedArtist(
      allArtists,
      allFavoriteIds,
      serendipityHistory
    );
    if (artist) {
      setSerendipityArtist(artist);
    }
  };

  const handleSerendipitySpinAgain = () => {
    const artist = getRandomUnfavoritedArtist(
      allArtists,
      allFavoriteIds,
      serendipityHistory
    );
    if (artist) {
      setSerendipityArtist(artist);
    }
  };

  const handleSerendipityClose = () => {
    setSerendipityArtist(null);
  };

  const handleSerendipityExplore = () => {
    setSerendipityArtist(null);
  };

  const handleAiScout = async () => {
    if (!aiPrompt.trim()) return;
    haptic.mediumTap();
    setIsAiLoading(true);
    
    const contextPrefix = selectedStage 
      ? `The user is currently focused on the ${selectedStage} area. ` 
      : '';

    try {
      const result = await recommendArtists({ 
        prompt: contextPrefix + aiPrompt,
        festivalId: festivalId 
      });
      setAiResult(result);
      setViewMode('ai');
      setIsAiDialogOpen(false);
    } catch (error) {
      console.error('AI Scout failed', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    haptic.lightTap();
    setViewMode(mode);
  };

  const handleVibeSelect = (vibe: string | null) => {
    haptic.lightTap();
    setSelectedVibe(vibe);
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const ArtistCard = ({ artist, size = 'default' }: { artist: typeof filteredArtists[0], size?: 'large' | 'default' }) => {
    const isHeadliner = artist.isHeadliner;
    const aiReason = aiResult?.recommendations.find(r => r.artistId === artist.id)?.reason;
    const isFave = favorites.has(artist.id);
    const isMustSee = mustSeeIds.has(artist.id);
    const isInterested = interestedIds.has(artist.id);
    const hasConflict = conflicts.has(artist.id);
    const isSeen = isMounted && seenIds.has(artist.id);

    return (
      <div className="relative group h-full">
        <Link
          href={`/artist/${artist.id}`}
          className={`relative flex flex-col h-full overflow-hidden rounded-[2.5rem] transition-all duration-700 bg-card border ${isHeadliner
            ? 'border-primary/40 shadow-2xl shadow-primary/10 scale-[1.02]'
            : 'border-white/5 hover:border-primary/40 hover:shadow-2xl'
            }`}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted shrink-0">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.artist}
                className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Music className="h-16 w-16 text-muted-foreground/10" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <div className="flex flex-col gap-1.5">
                {artist.returningHero && (
                  <Badge className="bg-[var(--accent)] text-black font-black italic border-none text-[8px] py-0 px-2 rounded-sm w-fit">
                    RETURNING HERO
                  </Badge>
                )}
                {artist.day && (
                  <Badge variant="secondary" className="bg-black/60 text-white border-white/10 text-[8px] font-black uppercase tracking-[0.2em] backdrop-blur-3xl px-2.5 py-1 rounded-full w-fit">
                    {artist.day}
                  </Badge>
                )}
                {hasConflict && isFave && (
                  <Badge variant="destructive" className="animate-pulse flex gap-1 items-center px-2 py-1 text-[8px] font-black rounded-full">
                    <AlertTriangle size={10} /> CLASH
                  </Badge>
                )}
              </div>
              {isMounted && (
                <div className="flex flex-col gap-1.5 items-end">
                  {isMustSee && (
                    <span className="text-sm drop-shadow-[0_0_8px_hsl(var(--accent)/0.9)]" title="Must See">⭐</span>
                  )}
                  {isInterested && (
                    <span className="text-sm drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]" title="Interested">🔖</span>
                  )}
                  {isSeen && (
                    <span className="bg-emerald-400 text-black text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">SEEN</span>
                  )}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex items-center gap-2 mb-2">
                {isMounted && (
                  <span className="text-xl drop-shadow-2xl" suppressHydrationWarning>
                    {getFlagEmoji(artist.countryCode)}
                  </span>
                )}
                <h3 className={`font-black uppercase tracking-tighter text-balance transition-all duration-500 text-white italic ${size === 'large' ? 'text-[1.6rem] md:text-[2rem] leading-[0.85]' : 'text-[1.4rem] md:text-[1.8rem] leading-[0.9]'
                  } ${isHeadliner ? 'text-primary group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(255,0,128,0.8)]' : 'group-hover:text-primary'}`}>
                  {artist.artist}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5 opacity-80">
                {artist.genres?.filter(g => g !== 'MUSIC').slice(0, 2).map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] border bg-white/5 backdrop-blur-3xl text-white border-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 transform scale-90 group-hover:scale-100 pointer-events-none">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-5 rounded-full shadow-2xl">
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {aiReason ? (
              <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 h-full flex items-center">
                <p className="text-[11px] font-bold text-primary leading-tight italic opacity-90">
                  "{aiReason}"
                </p>
              </div>
            ) : artist.vibes && artist.vibes.length > 0 && (
              <div className="px-6 py-3 bg-card/50 backdrop-blur-3xl border-t border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-40">
                  {artist.vibes.slice(0, 2).join(' • ')}
                </p>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(artist.id, isMustSee ? 'must_see' : 'interested');
          }}
          className={`absolute top-4 right-4 z-30 h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-3xl border ${
            isMustSee
              ? 'opacity-0 pointer-events-none'
              : isInterested
              ? 'opacity-0 pointer-events-none'
              : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:bg-black/60'
          }`}
        >
          <Heart size={18} fill="none" />
        </button>
      </div>
    );
  };

  const progress = Math.round((favorites.size / allArtists.length) * 100) || 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 pb-32">
      <header className="mb-20 text-center relative">
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 opacity-5 blur-[100px] bg-primary w-80 h-80 rounded-full" />
        <div className="mx-auto mb-12 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/5 shadow-2xl border border-primary/10 ring-1 ring-primary/20">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-7xl font-black tracking-tighter text-foreground sm:text-9xl uppercase italic leading-[0.8] mb-6">
          Music <span className="text-primary text-glow">Finder</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-xl font-medium text-muted-foreground leading-relaxed opacity-70 italic">
          Curate your personal journey at {config.name}.
        </p>

        {config.features.vibeOfTheHour && (
          <div className="mt-16 max-w-5xl mx-auto px-6">
             <VibeOfTheHour artists={allArtists} />
          </div>
        )}

        <div className="mt-16 max-w-lg mx-auto px-6">
          <NotificationBanner festivalId={festivalId} hasFavorites={favorites.size > 0} />
          <div className="flex justify-between items-end mb-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            <span>{config.name} Discovery</span>
            <span className="text-primary">{favorites.size} / {allArtists.length} Artists Saved</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-muted/20" />
        </div>

        <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-8">
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {config.features.spotifyIntegration && (
              <>
                <SpotifyConnect onMatchesFound={(ids) => {
                  setSpotifyMatches(ids);
                  setIsSpotifyConnected(true);
                  if (ids.length > 0) setViewMode('spotify');
                }} />
                {isSpotifyConnected && spotifyMatches.length > 0 && (
                  <PlaylistBuilder matchedArtistIds={spotifyMatches} />
                )}
              </>
            )}

            {/* Surprise Me */}
            <button
              onClick={handleSurpriseMe}
              className="flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-accent hover:bg-accent/90 text-black font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-accent/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Shuffle className="h-6 w-6" />
              SURPRISE ME
            </button>

            {/* Surprise Roulette */}
            {config.features.surpriseRoulette && (
              <button
                onClick={() => {
                  haptic.successBurst();
                  const unvisited = allArtists.filter(a => !allFavoriteIds.has(a.id));
                  const random = unvisited[Math.floor(Math.random() * unvisited.length)];
                  if (random) router.push(`/${config.id}/artist/${random.id}`);
                }}
                className="flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-accent hover:bg-accent/90 text-black font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-accent/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Shuffle className="h-6 w-6" />
                ROULETTE
              </button>
            )}

            {/* Speed Discovery */}
            <Link href={`/${config.id}/discover/speed`}>
              <button
                className="flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="h-6 w-6 fill-black" />
                SPEED DISCOVERY
              </button>
            </Link>

            {config.features.vibeQuiz && (
              <Link href={`/${config.id}/vibe-quiz`} className="inline-flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <Sparkles className="h-6 w-6" />
                Vibe Quiz
              </Link>
            )}

            {config.features.aiRecommendations && (
              <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center rounded-[1.5rem] h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.25em] gap-4 shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    <Wand2 className="h-6 w-6" />
                    AI Scout
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-indigo-500/20 rounded-[3.5rem] p-8 backdrop-blur-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-4xl font-black uppercase italic tracking-tighter">The Scout</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-lg leading-snug">
                      Describe your perfect festival vibe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-8">
                    <Input
                      placeholder="e.g. late night hard techno rave..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="h-20 rounded-[1.5rem] border-white/10 bg-muted/20 text-xl font-bold focus-visible:ring-indigo-500"
                    />
                    <Button
                      className="w-full h-20 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xl shadow-2xl"
                      onClick={handleAiScout}
                      disabled={isAiLoading || !aiPrompt.trim()}
                    >
                      {isAiLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'UNLEASH'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 -mx-4 mb-16 px-4 pb-10 pt-8 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* Radar Focus / Territory Selector */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-2">
              Radar Focus
            </p>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: null, label: 'GLOBAL RADAR' },
                ...(config.content.radarFocuses || [])
              ].map(focus => (
                <button
                  key={focus.label}
                  onClick={() => { haptic.lightTap(); setSelectedStage(focus.id); }}
                  className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-all duration-500 ${selectedStage === focus.id ? 'bg-foreground text-background border-foreground shadow-2xl scale-105' : 'bg-muted/10 border-white/5 text-muted-foreground hover:border-primary/40'}`}
                >
                  {focus.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row justify-between items-center">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40" />
              <Input
                placeholder="Search artists, bios, or vibes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-14 rounded-[1.5rem] bg-muted/20 border-white/5 text-base font-bold focus-visible:ring-primary shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="inline-flex rounded-[1.5rem] bg-muted/20 p-1.5 border border-white/5 shadow-inner shrink-0 overflow-x-auto no-scrollbar max-w-full">
              {[
                { id: 'discover', icon: Sparkles, label: 'Discover' },
                { id: 'az', icon: SortAsc, label: 'A-Z' },
                { id: 'by-day', icon: Calendar, label: 'By Day' },
                { id: 'by-country', icon: Globe, label: 'Country' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleViewModeChange(mode.id as ViewMode)}
                  className={`flex items-center gap-3 rounded-[1.2rem] px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap ${viewMode === mode.id ? 'bg-background text-foreground shadow-2xl border border-white/10 scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
              {isSpotifyConnected && (
                <button
                  onClick={() => handleViewModeChange('spotify')}
                  className={`flex items-center gap-3 rounded-[1.2rem] px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap ${viewMode === 'spotify' ? 'bg-[#1DB954] text-white shadow-2xl' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Matches
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => handleVibeSelect(null)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-all duration-500 ${!selectedVibe ? 'bg-primary border-primary text-white shadow-2xl scale-105' : 'bg-muted/20 border-white/5 text-muted-foreground hover:border-muted-foreground'}`}
            >
              ALL MOODS
            </button>
            {allVibeSet.map(vibe => (
              <button
                key={vibe}
                onClick={() => handleVibeSelect(vibe === selectedVibe ? null : vibe)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-all duration-500 ${selectedVibe === vibe ? 'bg-primary border-primary text-white shadow-2xl scale-105' : 'bg-muted/20 border-white/5 text-muted-foreground hover:border-muted-foreground'}`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Gems section — curated non-headliners with unusual vibes */}
      {(() => {
        const gems = HIDDEN_GEM_IDS
          .map(id => allArtistsCurrent.find(a => a.id === id))
          .filter((a): a is typeof allArtistsCurrent[0] => a !== undefined);
        if (gems.length === 0) return null;
        return (
          <section className="mb-20">
            <div className="flex items-center gap-6 mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                HIDDEN GEMS
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                ARTISTS YOU MIGHT MISS
              </p>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4">
              {gems.map(artist => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="shrink-0 w-40 group block"
                >
                  <div className="relative w-40 h-52 rounded-[2rem] overflow-hidden bg-muted border-2 border-accent/30 group-hover:border-accent/80 transition-all duration-500 shadow-accent/10 group-hover:shadow-accent/25 mb-3">
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.artist}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music className="h-10 w-10 text-muted-foreground/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-accent text-black text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">GEM</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      {isMounted && artist.countryCode && (
                        <span className="text-base drop-shadow-lg" suppressHydrationWarning>
                          {getFlagEmoji(artist.countryCode)}
                        </span>
                      )}
                      <p className="font-black uppercase italic text-white text-[11px] leading-tight tracking-tight truncate mt-0.5">
                        {artist.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 px-1">
                    {artist.vibes.slice(0, 2).map(vibe => (
                      <span
                        key={vibe}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] border bg-accent/5 text-accent border-accent/20"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      <TagCloud
        artists={allArtists}
        selectedGenre={selectedGenre}
        onGenreSelect={setSelectedGenre}
        selectedVibe={selectedVibe}
        onVibeSelect={handleVibeSelect}
      />

      {config.features.genreBreakdown && (
        <div className="max-w-5xl mx-auto mt-12 mb-20 px-6">
           <GenreBreakdown artists={allArtists} />
        </div>
      )}

      <div className="min-h-[600px]">
        {viewMode === 'ai' && aiResult && (
          <div className="space-y-20 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-10 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl">
              <div className="absolute right-[-60px] top-[-60px] opacity-10 rotate-12">
                <Wand2 size={320} className="text-indigo-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
                <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl shrink-0">
                  <Wand2 className="h-12 w-12" />
                </div>
                <div className="flex-1">
                  <h2 className="text-5xl font-black uppercase italic text-foreground tracking-tighter">Scout Analysis</h2>
                  <p className="text-indigo-500 font-black uppercase tracking-[0.3em] text-xs mt-3">Mood: "{aiPrompt}"</p>
                  <p className="mt-10 text-muted-foreground text-2xl leading-relaxed max-w-4xl font-medium opacity-90 italic">
                    {aiResult.scoutMessage}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'by-day' && (
          <div className="space-y-32">
            {DAY_ORDER.map(day => {
              const dayArtists = artistsByDay[day];
              if (!dayArtists || dayArtists.length === 0) return null;

              const headliners = dayArtists.filter(a => a.isHeadliner);
              const others = dayArtists.filter(a => !a.isHeadliner);

              return (
                <section key={day} className="animate-in fade-in duration-1000">
                  <div className="flex items-center gap-10 mb-16">
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter text-foreground">{day}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-40">{dayArtists.length} acts</span>
                  </div>

                  {headliners.length > 0 && (
                    <div className="mb-16">
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 sm:gap-12">
                        {headliners.map(artist => (
                          <ArtistCard key={artist.id} artist={artist} size="large" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
                    {others.map(artist => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {viewMode === 'by-country' && (
          <div className="space-y-32">
            {Object.keys(artistsByCountry).sort().map(country => {
              const countryArtists = artistsByCountry[country];
              if (!countryArtists || countryArtists.length === 0) return null;

              return (
                <section key={country} className="animate-in fade-in duration-1000">
                  <div className="flex items-center gap-10 mb-16">
                    <div className="flex items-center gap-6">
                      <span className="text-6xl drop-shadow-2xl" suppressHydrationWarning>{getFlagEmoji(country)}</span>
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground">{country === 'Unknown' ? 'International' : country}</h2>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
                    {countryArtists.map(artist => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {(viewMode === 'discover' || viewMode === 'az' || viewMode === 'spotify') && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {filteredArtists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>

      {filteredArtists.length === 0 && (
        <div className="py-48 text-center bg-muted/10 rounded-[5rem] border border-dashed border-white/5 max-w-5xl mx-auto shadow-inner">
          <div className="mx-auto mb-12 flex h-32 w-32 items-center justify-center rounded-full bg-muted/20 shadow-inner opacity-20">
            <LayoutGrid className="h-16 w-16 text-muted-foreground" />
          </div>
          <h3 className="text-5xl font-black uppercase italic text-foreground tracking-tighter">Zero Matches</h3>
          <p className="mt-8 text-muted-foreground text-2xl font-medium max-w-md mx-auto opacity-60 leading-relaxed italic">
            Your filters are too strict. Loosen up to find the magic.
          </p>
          <Button
            variant="outline"
            className="mt-16 rounded-[2rem] px-16 h-20 font-black uppercase tracking-[0.3em] border-white/10 text-base hover:bg-muted shadow-2xl transition-all hover:scale-105 active:scale-95"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedVibe(null);
              setSearchQuery('');
              setViewMode('discover');
            }}
          >
            Reset Radar
          </Button>
        </div>
      )}

      <SerendipityModal
        artist={serendipityArtist}
        onSpinAgain={handleSerendipitySpinAgain}
        onClose={handleSerendipityClose}
        onExplore={handleSerendipityExplore}
        isFavorite={serendipityArtist ? isFavorite(serendipityArtist.id) : false}
        onToggleFavorite={(artistId) => toggleFavorite(artistId, 'interested')}
      />
    </div>
  );
}
