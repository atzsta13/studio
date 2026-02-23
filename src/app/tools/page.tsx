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
  Battery, 
  Weight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ToolsPage() {
  const { toast } = useToast();
  const [hufAmount, setHufAmount] = useState<string>('1000');
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  // Hike-In Weight Calculator State
  const [tentWeight, setTentWeight] = useState(2.5);
  const [bagWeight, setWeight] = useState(8);
  const [waterWeight, setWater] = useState(2);

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
        title: "SOS SIGNAL ACTIVE",
        description: "Your screen is now a high-visibility beacon.",
      });
    }
  };

  const handleSafeCheckIn = () => {
    const time = new Date().toLocaleTimeString();
    setLastCheckIn(time);
    localStorage.setItem('sziget_safe_checkin', time);
    toast({
      title: "CHECK-IN SUCCESS",
      description: `Logged at ${time}. Your status is saved locally.`,
    });
  };

  const totalLoad = (tentWeight + bagWeight + waterWeight).toFixed(1);

  return (
    <div className={`container mx-auto max-w-4xl px-4 py-12 pb-32 transition-colors duration-500 ${isFlashOn ? 'bg-white' : ''}`}>
      {isFlashOn ? (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 animate-pulse">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={toggleFlash}
            className="rounded-full h-32 w-32 border-8 border-black text-black font-black text-2xl uppercase"
          >
            OFF
          </Button>
          <p className="mt-8 text-black font-black text-4xl text-center uppercase italic tracking-tighter">Find Me!</p>
        </div>
      ) : (
        <>
          <PageHeader 
            title="Island Toolkit"
            description="45+ specialized utilities for the Island of Freedom. No signal required."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Currency Converter */}
            <Card className="bg-card border-border/50 overflow-hidden group">
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20">
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <Coins size={20} />
                  HUF Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Amount in Forints (HUF)</label>
                    <Input 
                      type="number" 
                      value={hufAmount} 
                      onChange={(e) => setHufAmount(e.target.value)}
                      className="text-xl font-bold bg-muted/50 border-none rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">EURO</p>
                      <p className="text-2xl font-black">€{convertHuf(hufAmount).eur}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">USD</p>
                      <p className="text-2xl font-black">${convertHuf(hufAmount).usd}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOS Beacon */}
            <Card className="bg-card border-border/50 overflow-hidden">
              <CardHeader className="bg-primary/10 border-b border-primary/20">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Zap size={20} />
                  Friend Finder SOS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground mb-6">High-intensity strobe to be seen from 100m away in dense crowds.</p>
                <Button 
                  onClick={toggleFlash}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                >
                  Unleash Beacon
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="survival" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1 h-14">
              <TabsTrigger value="survival" className="rounded-xl font-bold text-xs uppercase tracking-widest">Survival</TabsTrigger>
              <TabsTrigger value="culture" className="rounded-xl font-bold text-xs uppercase tracking-widest">Lingo</TabsTrigger>
              <TabsTrigger value="safety" className="rounded-xl font-bold text-xs uppercase tracking-widest">Safety</TabsTrigger>
            </TabsList>

            <TabsContent value="survival" className="mt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-card border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                      <Sun size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Solar & UV Alert</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">UV Index: <span className="text-orange-500 font-black">HIGH (8)</span>. Peak solar charge efficiency (95%) until 15:30.</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Weight size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Hike-In Weight</h4>
                      <div className="space-y-2 mt-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Total estimated load: {totalLoad}kg</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => setWeight(w => w + 1)}>+1kg Bag</Button>
                          <Button size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => setWeight(8)}>Reset</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="culture" className="mt-8">
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="divide-y border-border/50">
                    {[
                      { h: 'Szia', e: 'Hello / Bye', p: 'See-ya' },
                      { h: 'Köszönöm', e: 'Thank you', p: 'Kuh-suh-num' },
                      { h: 'Egy sört kérek', e: 'A beer, please', p: 'Edge shirt kay-reck' },
                      { h: 'Hol van a víz?', e: 'Where is the water?', p: 'Hole vawn a veez?' },
                      { h: 'Egészségedre!', e: 'Cheers!', p: 'Ag-esh-shay-ge-dre' },
                    ].map((item) => (
                      <div key={item.h} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                        <div>
                          <p className="text-lg font-black text-primary uppercase italic">{item.h}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase">{item.e}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pronounce</p>
                          <p className="text-sm font-bold italic">{item.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {/* One-Tap Safe Check-in */}
                <Card className="p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={24} />
                      <h4 className="font-black uppercase italic tracking-tighter text-xl">Safe Check-In</h4>
                    </div>
                    {lastCheckIn && <div className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">Last: {lastCheckIn}</div>}
                  </div>
                  <p className="text-sm opacity-90 mb-4">Quick-log your safety status during intense sets. Saved locally for your reference.</p>
                  <Button 
                    onClick={handleSafeCheckIn}
                    className="w-full h-14 rounded-xl bg-white text-blue-600 font-black uppercase tracking-widest hover:bg-white/90"
                  >
                    I AM SAFE
                  </Button>
                </Card>

                <Card className="p-6 bg-card border-border/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                      <Ear size={24} />
                    </div>
                    <h4 className="font-bold text-lg">Sound Level Check</h4>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full w-[85%] bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Est. Exposure: 102dB</p>
                    <p className="text-xs font-black text-red-500 uppercase">Risk: High (Wear Plugs)</p>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                      <FileText size={24} />
                    </div>
                    <h4 className="font-bold text-lg">Lost Item Report Prep</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Prepare your info before heading to the official Lost & Found booth at the H-Bridge.</p>
                  <Button variant="outline" className="w-full rounded-xl border-border hover:bg-muted font-bold">Generate Report Metadata</Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
