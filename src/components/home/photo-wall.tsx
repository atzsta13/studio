'use client';

import { Card } from '@/components/ui/card';
import { Camera, Heart, MessageSquare } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

const MOCK_PHOTOS = [
  { id: '1', url: 'https://media.appmiral.com/prod/performance/0056/95/thumb_5594558_performance_1440.jpeg', user: '@raver_42', likes: 242 },
  { id: '2', url: 'https://media.appmiral.com/prod/performance/0057/08/thumb_5607360_performance_1440.jpeg', user: '@insider_01', likes: 1105 },
  { id: '3', url: 'https://media.appmiral.com/prod/performance/0057/10/thumb_5609665_performance_1080.jpeg', user: '@scout_master', likes: 89 },
  { id: '4', url: 'https://media.appmiral.com/prod/performance/0056/95/thumb_5594558_performance_1440.jpeg', user: '@legendary_fan', likes: 450 },
];

export function PhotoWall() {
  return (
    <div className="mt-24">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 text-primary rounded-[2rem] shadow-2xl">
            <Camera size={32} />
          </div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter">Island Wall</h3>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 hidden md:block">
          Tagged #SZIGETINSIDER
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {MOCK_PHOTOS.map(photo => (
          <Card key={photo.id} className="group relative aspect-square rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
             <img src={photo.url} alt="Fan photo" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 backdrop-blur-[2px]">
                <p className="text-white font-black italic tracking-tight mb-4 text-xl">{photo.user}</p>
                <div className="flex gap-6">
                   <div className="flex items-center gap-2 text-primary font-black text-sm">
                      <Heart size={16} fill="currentColor" /> {photo.likes}
                   </div>
                   <div className="flex items-center gap-2 text-white font-black text-sm opacity-60">
                      <MessageSquare size={16} /> {Math.floor(photo.likes / 10)}
                   </div>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
