'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Lock } from 'lucide-react';
import { useAchievements } from '@/hooks/use-achievements';
import { Progress } from '@/components/ui/progress';

export function AchievementGallery() {
  const { achievements } = useAchievements();
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem] mt-20">
      <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/10 px-10 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <CardTitle className="flex items-center gap-4 text-yellow-500 text-2xl font-black uppercase italic tracking-tighter">
            <Trophy size={32} />
            Insider Medals
          </CardTitle>
          <div className="flex-1 max-w-xs space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <span>Collection Status</span>
               <span className="text-yellow-500">{unlockedCount} / {achievements.length}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {achievements.map((a) => (
            <div 
              key={a.id} 
              className={`group flex flex-col items-center text-center p-6 rounded-[2rem] border transition-all duration-500 ${
                a.isUnlocked 
                  ? 'bg-yellow-500/10 border-yellow-500/20 scale-100 shadow-2xl' 
                  : 'bg-white/5 border-white/5 opacity-40 grayscale blur-[1px]'
              }`}
            >
              <div className="text-4xl mb-4 transform transition-transform group-hover:scale-125 duration-500">{a.isUnlocked ? a.icon : '🔒'}</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-balance leading-tight">{a.title}</p>
              {a.isUnlocked && (
                <p className="text-[8px] font-medium text-muted-foreground mt-2 leading-tight italic opacity-60">{a.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
