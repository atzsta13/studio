'use client';

import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

export function PhotoWall() {
  return (
    <div className="mt-24">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 text-primary rounded-[2rem] shadow-2xl">
            <Camera size={32} />
          </div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter">{FESTIVAL.name} Wall</h3>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 hidden md:block">
          #{FESTIVAL.id.replace('-', '').toUpperCase()}
        </p>
      </div>

      <Card className="bg-card/30 border-white/5 rounded-[2.5rem] p-12 text-center">
        <p className="font-bold text-lg text-muted-foreground/60 italic">
          Fan photos will appear here during {FESTIVAL.name}.
        </p>
      </Card>
    </div>
  );
}
