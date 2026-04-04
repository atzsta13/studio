'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Music, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { matchGlobalFestival, type MatchOutput } from '@/ai/flows/global-match-flow';
import Link from 'next/link';

export function GlobalMatchmaker() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatchOutput | null>(null);

  const handleMatch = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const match = await matchGlobalFestival({ prompt });
      setResult(match);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="p-16 rounded-[4rem] bg-primary/5 border border-primary/10 relative overflow-hidden"
    >
      <div className="absolute top-[-50px] right-[-50px] opacity-10 blur-[80px] bg-primary w-80 h-80 rounded-full pointer-events-none" />
      <Sparkles className="h-16 w-16 text-primary mx-auto mb-8 relative z-10" />
      <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-6 relative z-10">Global Vibe Scout</h3>
      
      {!result && (
        <div className="flex justify-center gap-4 mb-10 relative z-10">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Privacy Shield Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Genkit Core 2.0</span>
          </div>
        </div>
      )}
      
      {!result ? (
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xl text-muted-foreground italic mb-10 leading-relaxed">
            Describe your perfect summer festival. Do you want heavy bass in the dust, or indie pop by the river? Let our AI match you to the perfect ecosystem.
          </p>
          <div className="space-y-6">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I want late night techno and high energy raves..."
              className="h-20 text-center text-lg bg-black/50 border-white/10 rounded-[2rem] focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMatch();
              }}
            />
            <Button 
              onClick={handleMatch}
              disabled={isLoading || prompt.length < 5}
              className="h-20 w-full px-12 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.3em] text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'Launch Matchmaker'}
            </Button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-left max-w-2xl mx-auto"
        >
          <div className="p-10 rounded-[3rem] bg-black/80 border border-primary/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-[1.5rem] bg-primary/20 text-primary">
                <MapPin size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Your Perfect Match</p>
                <h4 className="text-4xl font-black uppercase italic tracking-tighter">{result.festivalName}</h4>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground italic leading-relaxed mb-10">
              "{result.reason}"
            </p>

            <div className="space-y-4 mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Top 3 Artists for you</p>
              {result.topArtists.map((artist, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                  <div className="mt-1"><Music size={16} className="text-primary" /></div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-white">{artist.artistName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{artist.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setResult(null)} 
                variant="outline" 
                className="flex-1 h-16 rounded-[1.5rem] border-white/10 hover:bg-white/5 uppercase font-black tracking-widest text-xs"
              >
                Search Again
              </Button>
              <Button 
                asChild
                className="flex-1 h-16 rounded-[1.5rem] bg-primary text-white uppercase font-black tracking-widest text-xs shadow-xl shadow-primary/20"
              >
                <Link href={`/${result.festivalId}`}>
                  Enter Festival <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
