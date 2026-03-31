'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar } from 'lucide-react';
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
      <CardContent className="p-10 text-center">
        <div className="py-8">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400/40 mb-4">
            Radar unavailable pre-festival
          </p>
          <p className="text-lg font-medium text-muted-foreground/60 italic">
            Live precipitation radar for {FESTIVAL.location.weatherDisplayName} will be
            available when {FESTIVAL.name} begins.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
