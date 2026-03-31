'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ChevronRight, Bell } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

const MOCK_NEWS = [
  { id: '1', type: 'ALERT', text: 'Water refill point #4 near Colosseum is temporarily down.', time: '10m ago' },
  { id: '2', type: 'UPDATE', text: 'Secret set at the Island Eye announced for 00:30.', time: '45m ago' },
  { id: '3', type: 'WEATHER', text: 'High winds expected at 18:00. Secure all tent pegs.', time: '1h ago' },
];

export function NewsBulletin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Newspaper size={24} />
          </div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">Island News</h3>
        </div>
        <Badge variant="outline" className="text-indigo-500 border-indigo-500/20 font-black tracking-widest uppercase text-[9px] py-1 px-4">
          <Bell className="mr-2 h-3 w-3 animate-bounce" /> Live Updates
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_NEWS.map(news => (
          <Card key={news.id} className="bg-card/30 backdrop-blur-3xl border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:translate-x-4">
            <CardContent className="p-8 flex items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <Badge className={`mt-1 font-black uppercase tracking-widest text-[8px] py-1 px-3 ${
                  news.type === 'ALERT' ? 'bg-red-500' : 
                  news.type === 'WEATHER' ? 'bg-orange-500' : 'bg-indigo-500'
                }`}>
                  {news.type}
                </Badge>
                <div>
                  <p className="font-bold text-lg leading-snug mb-2">{news.text}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{news.time}</p>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground/20 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
