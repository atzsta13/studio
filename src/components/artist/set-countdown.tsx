'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';

export function SetCountdown({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (!timeLeft) return null;

  return (
    <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
      <CardContent className="p-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-2xl">
              <Clock size={32} />
            </div>
            <div>
               <p className="font-black uppercase tracking-widest text-[10px] mb-1">Set Countdown</p>
               <div className="flex gap-4 text-3xl font-black italic tracking-tighter">
                  {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
                  <span>{timeLeft.hours}h</span>
                  <span>{timeLeft.minutes}m</span>
                  <span className="text-white/40">{timeLeft.seconds}s</span>
               </div>
            </div>
         </div>
         <div className="hidden md:block opacity-20 transform -rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Zap size={64} />
         </div>
      </CardContent>
    </Card>
  );
}
