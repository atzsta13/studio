'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ShieldAlert, SignalHigh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// S-O-S pattern: . . . --- --- --- . . .
const SOS_PATTERN = '...---...';

export function SOSMorse() {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let patternIdx = 0;

    const runPattern = () => {
      if (!isActive) {
        setIsLightOn(false);
        return;
      }

      const symbol = SOS_PATTERN[patternIdx];
      const duration = symbol === '.' ? 200 : 600;
      
      setIsLightOn(true);
      
      timeoutId = setTimeout(() => {
        setIsLightOn(false);
        
        // Gap between symbols
        timeoutId = setTimeout(() => {
          patternIdx = (patternIdx + 1) % SOS_PATTERN.length;
          runPattern();
        }, 200);
      }, duration);
    };

    if (isActive) {
      runPattern();
    }

    return () => clearTimeout(timeoutId);
  }, [isActive]);

  const toggleSOS = () => {
    setIsActive(!isActive);
    if (!isActive) {
      toast({
        title: "SOS ACTIVE",
        description: "Your screen is broadcasting SOS in Morse code.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {isActive && isLightOn && (
        <div className="fixed inset-0 z-[2000] bg-white pointer-events-none transition-opacity duration-100" />
      )}
      <Card className="bg-red-600/10 border-red-500/20 shadow-2xl overflow-hidden rounded-[3rem] backdrop-blur-3xl">
        <CardHeader className="bg-red-500/10 border-b border-red-500/10 px-10 py-8">
          <CardTitle className="flex items-center gap-4 text-red-500 text-2xl font-black uppercase italic tracking-tighter">
            <ShieldAlert size={32} />
            SOS Morse Beacon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div className="space-y-8">
            <div className="flex items-center justify-center p-12 rounded-[2.5rem] bg-black/40 border border-white/5 relative overflow-hidden">
               <div className={`h-24 w-24 rounded-full border-4 ${isActive ? 'border-red-500 animate-ping' : 'border-white/10 opacity-20'} flex items-center justify-center`}>
                  <Zap size={40} className={isActive ? 'text-red-500' : 'text-white/10'} />
               </div>
               {isActive && (
                 <p className="absolute bottom-6 font-black text-red-500 uppercase tracking-[0.5em] text-[10px] animate-pulse">Broadcasting SOS</p>
               )}
            </div>

            <p className="text-base font-medium text-muted-foreground text-center italic opacity-80 leading-relaxed">
              Flashes the screen in the international SOS pattern (...) (---) (...). <br />
              Use in absolute emergencies to signal your location.
            </p>

            <Button 
              onClick={toggleSOS}
              variant={isActive ? "secondary" : "destructive"}
              className={`w-full h-20 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 gap-4 ${isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}
            >
              <SignalHigh size={24} />
              {isActive ? "Deactivate Beacon" : "Activate SOS Beacon"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
