
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Coins, 
  Zap, 
  Sun, 
  Ear, 
  FileText, 
  Weight,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ToolsPage() {
  const { toast } = useToast();
  const [hufAmount, setHufAmount] = useState<string>('1000');
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  // Hike-In Weight Calculator State
  const [bagWeight, setWeight] = useState(8);
  const tentWeight = 2.5;
  const waterWeight = 2;

  // Safe Check-in state
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sziget_safe_checkin');
    if (saved) setLastCheckIn(saved);
  }, []);

  const convertHuf = (amount: string) => {
    const val = parseFloat(amount) || 0;
    return {
      eur: (val * 0.0025).toFixed(2),
      usd: (val * 0.0027).toFixed(2)
    };
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    if (!isFlashOn) {
      toast({
        title: "SIGNAL ACTIVE",
        description: "Your screen is now a tactical beacon.",
      });
    }
  };

  const handleSafeCheckIn = () => {
    const time = new Date().toLocaleTimeString();
    setLastCheckIn(time);
    localStorage.setItem('sziget_safe_checkin', time);
    toast({
      title: "STATUS SAVED",
      description: `Logged at ${time}. Stay safe, Szitizen.`,
    });
  };

  const totalLoad = (tentWeight + bagWeight + waterWeight).toFixed(1);

  return (
    <div className={`container mx-auto max-w-4xl px-4 py-16 pb-32 transition-colors duration-700 ${isFlashOn ? 'bg-white' : ''}`}>
      {isFlashOn ? (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-10 animate-pulse">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={toggleFlash}
            className="rounded-full h-40 w-40 border-[12px] border-black text-black font-black text-3xl uppercase shadow-2xl"
          >
            OFF
          </Button>
          <p className="mt-12 text-black font-black text-5xl text-center uppercase italic tracking-tighter leading-none">Find Me Here!</p>
        </div>
      ) : (
        <>
          <PageHeader 
            title="Survival Toolkit"
            description="High-performance utilities for the Island of Freedom. Zero signal required."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Currency Converter */}
            <Card className="bg-card border-border shadow-xl overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 px-8 py-6">
                <CardTitle className="flex items-center gap-3 text-emerald-600 text-xl font-black uppercase italic tracking-tight">
                  <Coins size={24} />
                  HUF Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Forints (HUF)</label>
                    <Input 
                      type="number" 
                      value={hufAmount} 
                      onChange={(e) => setHufAmount(e.target.value)}
                      className="h-16 text-3xl font-black bg-muted/50 border-none rounded-2xl px-6"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-background border border-border shadow-inner">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">EURO</p>
                      <p className="text-3xl font-black tracking-tighter">€{convertHuf(hufAmount).eur}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-background border border-border shadow-inner">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">USD</p>
                      <p className="text-3xl font-black tracking-tighter">${convertHuf(hufAmount).usd}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOS Beacon */}
            <Card className="bg-card border-border shadow-xl overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
                <CardTitle className="flex items-center gap-3 text-primary text-xl font-black uppercase italic tracking-tight">
                  <Zap size={24} />
                  Crowd Finder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-muted-foreground mb-8 max-w-xs leading-relaxed">High-intensity tactical strobe to signal friends in the thickest of crowds.</p>
                <Button 
                  onClick={toggleFlash}
                  className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.25em] text-lg shadow-2xl shadow-primary/30 transition-transform active:scale-95"
                >
                  Unleash Strobe
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="survival" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-[1.5rem] bg-muted/50 p-1.5 h-16 border border-border/50">
              <TabsTrigger value="survival" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg">Tactical</TabsTrigger>
              <TabsTrigger value="culture" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg">Culture</TabsTrigger>
              <TabsTrigger value="safety" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg">Safety</TabsTrigger>
            </TabsList>

            <TabsContent value="survival" className="mt-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="p-8 bg-card border-border rounded-[2.5rem] shadow-lg">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 shadow-inner">
                      <Sun size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2 uppercase italic tracking-tight">Solar Forecast</h4>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        UV Index: <span className="text-orange-500 font-black">HIGH (8)</span>. <br/>
                        Optimal charging: 10:00 - 15:30.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-card border-border rounded-[2.5rem] shadow-lg">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                      <Weight size={32} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl mb-2 uppercase italic tracking-tight">Gear Loadout</h4>
                      <div className="space-y-3 mt-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Estimated: {totalLoad}kg</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" className="h-9 text-[10px] font-black rounded-xl flex-1 uppercase tracking-widest" onClick={() => setWeight(w => w + 1)}>+1kg</Button>
                          <Button size="sm" variant="ghost" className="h-9 text-[10px] font-black rounded-xl uppercase tracking-widest" onClick={() => setWeight(8)}>Reset</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="culture" className="mt-10">
              <Card className="border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {[
                      { h: 'Szia', e: 'Hello / Bye', p: 'See-ya' },
                      { h: 'Köszönöm', e: 'Thank you', p: 'Kuh-suh-num' },
                      { h: 'Egy sört kérek', e: 'A beer, please', p: 'Edge shirt kay-reck' },
                      { h: 'Hol van a víz?', e: 'Where is the water?', p: 'Hole vawn a veez?' },
                      { h: 'Egészségedre!', e: 'Cheers!', p: 'Ag-esh-shay-ge-dre' },
                    ].map((item) => (
                      <div key={item.h} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                        <div>
                          <p className="text-2xl font-black text-primary uppercase italic tracking-tighter leading-none mb-1">{item.h}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{item.e}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-40">Phonetic</p>
                          <p className="text-sm font-bold italic text-foreground">{item.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="mt-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-10 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-500/20 rounded-[3rem] relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                    <ShieldCheck size={180} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                          <ShieldCheck size={32} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-tighter text-3xl">Safe Check-In</h4>
                      </div>
                      {lastCheckIn && <div className="text-[10px] font-black uppercase bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">Last: {lastCheckIn}</div>}
                    </div>
                    <p className="text-lg font-medium opacity-90 mb-8 max-w-md leading-relaxed">Instantly log your safety status during intense sets. This data is stored strictly on your device.</p>
                    <Button 
                      onClick={handleSafeCheckIn}
                      className="w-full h-20 rounded-[1.5rem] bg-white text-indigo-600 font-black uppercase tracking-[0.25em] text-xl hover:bg-white/90 shadow-2xl transition-transform active:scale-95"
                    >
                      I AM SAFE
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 bg-card border-border rounded-[2.5rem] shadow-lg">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 shadow-inner">
                      <Ear size={32} />
                    </div>
                    <h4 className="font-black text-xl uppercase italic tracking-tight">Audio Safety Monitor</h4>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden mb-4 shadow-inner">
                    <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Est. Exposure: 102dB</p>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Wear Earplugs</p>
                  </div>
                </Card>

                <Card className="p-8 bg-card border-border rounded-[2.5rem] shadow-lg">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 shadow-inner">
                      <FileText size={32} />
                    </div>
                    <h4 className="font-black text-xl uppercase italic tracking-tight">Lost Item Log</h4>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-6 leading-relaxed max-w-md">Structured preparation tool for official Hungarian police or festival security reports.</p>
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-border hover:bg-muted font-black uppercase tracking-widest text-xs">Generate Metadata</Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
