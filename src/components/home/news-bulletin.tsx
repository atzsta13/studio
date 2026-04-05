'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Bell } from 'lucide-react';
import { getFestivalConfig } from '@/config/festival-engine';

export function NewsBulletin({ festivalId }: { festivalId: string }) {
  const config = getFestivalConfig(festivalId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Newspaper size={24} />
          </div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">{config.name} News</h3>
        </div>
        <Badge variant="outline" className="text-indigo-500/60 border-indigo-500/20 font-black tracking-widest uppercase text-[9px] py-1 px-4">
          <Bell className="mr-2 h-3 w-3" /> Coming Soon
        </Badge>
      </div>

      <Card className="bg-card/30 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-8 text-center">
          <p className="font-bold text-lg leading-snug text-muted-foreground/60 italic">
            Live festival updates will appear here once {config.name} begins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
