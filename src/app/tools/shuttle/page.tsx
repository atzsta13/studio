'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { FESTIVAL } from '@/config/festival';
import { Bus, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SHUTTLES = [
  { id: '1', route: 'City Center Express', from: 'Deák Ferenc tér', to: 'Bridge of Freedom', freq: 'Every 15m', active: '24/7' },
  { id: '2', route: 'Airport Shuttle', from: 'Budapest Airport (BUD)', to: 'Island Entrance', freq: 'Every 30m', active: '08:00 - 22:00' },
  { id: '3', route: 'Camping North', from: 'H-HÉV Station', to: 'North Camping Gate', freq: 'Every 20m', active: '10:00 - 02:00' },
];

export default function ShuttlePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 pb-32">
      <PageHeader 
        title="Shuttle Network" 
        description={`Rapid transport across the ${FESTIVAL.name} ecosystem. Synchronize your movements.`}
      />

      <div className="grid grid-cols-1 gap-8 mt-16">
        {SHUTTLES.map(s => (
          <Card key={s.id} className="bg-card/50 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl">
             <CardContent className="p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className="p-5 rounded-[2rem] bg-emerald-500/10 text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                         <Bus size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{s.route}</h3>
                         <div className="flex items-center gap-3 text-muted-foreground font-medium italic opacity-60">
                            <span className="text-foreground">{s.from}</span>
                            <ArrowRight size={14} />
                            <span className="text-foreground">{s.to}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                         <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Frequency</p>
                         <p className="font-bold text-sm italic">{s.freq}</p>
                      </div>
                      <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                         <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active</p>
                         <p className="font-bold text-sm italic">{s.active}</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-emerald-600/10 border border-emerald-500/20 rounded-[3rem] p-10 text-center italic">
         <p className="text-emerald-500 font-bold leading-relaxed">
            * Shuttle schedules are subject to local traffic and Island security protocols. 
            Check live notifications for delays.
         </p>
      </Card>
    </div>
  );
}
