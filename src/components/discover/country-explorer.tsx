'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Trophy } from 'lucide-react';
import type { LineupItem } from '@/types';
import { useMemo } from 'react';

interface CountryExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  artists: LineupItem[];
  onCountrySelect: (country: string | null) => void;
  selectedCountry: string | null;
}

export function CountryExplorer({ 
  isOpen, 
  onClose, 
  artists, 
  onCountrySelect, 
  selectedCountry 
}: CountryExplorerProps) {
  
  const countryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    artists.forEach(a => {
      const c = a.countryCode || 'Unknown';
      stats[c] = (stats[c] || 0) + 1;
    });
    
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count }));
  }, [artists]);

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === 'Unknown') return '🌐';
    const trimmedCode = countryCode.trim().toUpperCase();
    const code = trimmedCode === 'UK' ? 'GB' : trimmedCode;
    try {
      const codePoints = code
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch { return '🌐'; }
  };

  const topCountry = countryStats[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-white/5 rounded-[3.5rem] p-0 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <DialogHeader className="p-10 bg-primary/10 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-primary text-white shadow-xl">
              <Globe size={32} />
            </div>
            <div>
              <DialogTitle className="text-4xl font-black uppercase italic tracking-tighter">Country Radar</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-lg leading-tight mt-1 italic">
                {countryStats.length} nations represented on the Island.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10">
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Most Acts From</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getFlagEmoji(topCountry?.code)}</span>
                <span className="text-xl font-black italic uppercase">{topCountry?.code === 'Unknown' ? 'International' : topCountry?.code}</span>
              </div>
            </div>
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Global Coverage</p>
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-primary" />
                <span className="text-xl font-black italic uppercase">{countryStats.length} Countries</span>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[400px] pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {countryStats.map(({ code, count }) => (
                <button
                  key={code}
                  onClick={() => {
                    onCountrySelect(code === 'Unknown' ? null : code);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                    selectedCountry === code || (code === 'Unknown' && !selectedCountry)
                      ? 'bg-primary border-primary text-white shadow-xl scale-[1.02]'
                      : 'bg-white/5 border-white/5 hover:border-primary/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl drop-shadow-lg group-hover:scale-110 transition-transform">{getFlagEmoji(code)}</span>
                    <span className="font-black uppercase italic tracking-tight">{code === 'Unknown' ? 'International' : code}</span>
                  </div>
                  <Badge variant="outline" className={`${
                    selectedCountry === code ? 'border-white/40 text-white' : 'border-white/10 text-muted-foreground'
                  } px-3 py-1 font-black`}>
                    {count} acts
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
