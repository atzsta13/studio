'use client';

import { Card } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { getFestivalConfig } from '@/config/festival';

export function FanPoll({ festivalId }: { festivalId: string }) {
  const config = getFestivalConfig(festivalId);

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem] p-10 mt-12">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <BarChart2 size={24} />
        </div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Fan Poll</h3>
      </div>

      <p className="text-lg font-medium text-muted-foreground/60 italic leading-relaxed text-center py-6">
        Live polls will open when {config.name} begins.
      </p>
    </Card>
  );
}
