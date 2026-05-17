'use client';

import Link from 'next/link';
import { FESTIVAL_CONFIGS } from '@/config/festival-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Music2, ArrowRight, MapPin, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlobalSearch } from '@/components/home/global-search';
import { GlobalRadar } from '@/components/home/global-radar';

export default function HubPage() {
  const festivals = Object.values(FESTIVAL_CONFIGS);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white pb-20">
      {/* Hero Section */}
      <header className="container mx-auto pt-24 pb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-12"
        >
          <div className="bg-primary/10 p-4 rounded-[2rem] border border-primary/20 shadow-2xl shadow-primary/10">
            <Music2 className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
              Festival <span className="text-primary text-glow">Insider</span> Hub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
              Your elite tactical gateway to global festival intelligence.
            </p>
          </div>

          <div className="flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 border-y border-white/5 py-6 px-12">
            <div><span className="text-white text-lg mr-2 tracking-tighter">05</span> Festivals</div>
            <div className="h-1 w-1 rounded-full bg-primary/20" />
            <div><span className="text-white text-lg mr-2 tracking-tighter">800+</span> Artists</div>
            <div className="h-1 w-1 rounded-full bg-primary/20" />
            <div><span className="text-white text-lg mr-2 tracking-tighter">100%</span> Offline</div>
          </div>

          <GlobalSearch />
        </motion.div>
      </header>

      {/* Global Tactical Radar */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4">Satellite Intelligence</p>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Tactical Ecosystem Radar</h2>
        </div>
        <GlobalRadar />
      </section>

      {/* Festival Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {festivals.map((fest, index) => (
            <motion.div
              key={fest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/${fest.id}`}>
                <Card className="group relative h-[400px] bg-card/50 border-white/5 overflow-hidden rounded-[3.5rem] transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 active:scale-95 cursor-pointer shadow-2xl">
                  {/* Visual Background (Placeholder style) */}
                  <div 
                    className="absolute inset-0 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000"
                    style={{ 
                      background: `radial-gradient(circle at center, ${fest.theme.primaryHex}44 0%, transparent 70%)` 
                    }}
                  />
                  
                  <CardContent className="h-full p-12 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 group-hover:border-primary/40 transition-colors">
                          <Music2 className="h-8 w-8 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Status</p>
                          <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                            Live Intelligence
                          </span>
                        </div>
                      </div>
                      
                      <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none group-hover:text-primary transition-colors">
                        {fest.name}
                      </h2>
                      <p className="text-lg font-bold text-muted-foreground italic leading-tight">
                        {fest.tagline}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" />
                          {fest.location.city}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary" />
                          {fest.dates.year}
                        </div>
                      </div>
                      
                      <div className="h-16 w-full rounded-[1.5rem] bg-foreground text-background flex items-center justify-between px-8 font-black uppercase tracking-[0.3em] text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        Enter Insider
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-20 text-center border-t border-white/5 mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
          Festival Insider Ecosystem © 2026 · Antigravity Core
        </p>
      </footer>
    </div>
  );
}
