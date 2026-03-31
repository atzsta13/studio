'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Wind, Thermometer, Radar } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

export function WeatherRadar() {
  return (
    <Card className="bg-blue-600/10 border-blue-500/20 shadow-2xl overflow-hidden rounded-[3rem] backdrop-blur-3xl">
      <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 px-10 py-8 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-4 text-blue-400 text-2xl font-black uppercase italic tracking-tighter">
          <Radar size={32} />
          Weather Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="flex flex-col lg:flex-row gap-10">
           <div className="relative flex-1 aspect-square bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden flex items-center justify-center">
              {/* Mock Radar Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-[2px] bg-blue-500/40 animate-[spin_4s_linear_infinite]" />
                 <div className="w-3/4 h-3/4 border border-blue-500/20 rounded-full" />
                 <div className="w-1/2 h-1/2 border border-blue-500/20 rounded-full" />
                 <div className="w-1/4 h-1/4 border border-blue-500/20 rounded-full" />
                 
                 {/* Mock Clouds */}
                 <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
                 <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
              </div>
              <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 opacity-60">Scanning Island Airspace...</p>
           </div>

           <div className="flex flex-col justify-center gap-6 lg:w-64">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <Thermometer className="text-orange-400" />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Temp</p>
                    <p className="text-2xl font-black italic">32°C</p>
                 </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <CloudRain className="text-blue-400" />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Precip</p>
                    <p className="text-2xl font-black italic">5%</p>
                 </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <Wind className="text-zinc-400" />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Wind</p>
                    <p className="text-2xl font-black italic">12 km/h</p>
                 </div>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
