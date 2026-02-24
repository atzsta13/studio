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
  QrCode,
  MapPin,
  Share2,
  Languages
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ToolsPage() {
  const { toast } = useToast();
  const [hufAmount, setHufAmount] = useState<string>('1000');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showQr, setShowQr] = useState(false);
  
  const [bagWeight, setWeight] = useState(8);
  const tentWeight = 2.5;
  const waterWeight = 2;

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

  const handleGenerateShareCode = () => {
    setShowQr(true);
    toast({
      title: "OFFLINE QR READY",
      description: "Friends can scan this to save your meet-up point.",
    });
  };

  const totalLoad = (tentWeight + bagWeight + waterWeight).toFixed(1);

  return (
    <div className={`container mx-auto max-w-5xl px-4 py-20 pb-32 transition-colors duration-1000 ${isFlashOn ? 'bg-white' : ''}`}>
      {isFlashOn ? (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-10 animate-pulse">
          <button 
            onClick={toggleFlash}
            className="rounded-full h-56 w-56 border-[16px] border-black text-black font-black text-5xl uppercase shadow-2xl flex items-center justify-center bg-transparent transition-transform hover:scale-110 active:scale-95"
          >
            OFF
          </button>
          <p className="mt-16 text-black font-black text-7xl text-center uppercase italic tracking-tighter leading-none">Find Me!</p>
        </div>
      ) : (
        <>
          <div className="mb-20">
            <PageHeader 
              title="Survival Toolkit"
              description="Elite tactical utilities for the Island of Freedom. No signal required."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/10 px-10 py-8">
                <CardTitle className="flex items-center gap-4 text-emerald-500 text-2xl font-black uppercase italic tracking-tighter">
                  <Coins size={32} />
                  HUF Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-8">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-3 block">Forints (HUF)</label>
                    <Input 
                      type="number" 
                      value={hufAmount} 
                      onChange={(e) => setHufAmount(e.target.value)}
                      className="h-20 text-4xl font-black bg-muted/20 border-none rounded-[1.5rem] px-8 shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[1.5rem] bg-background border border-white/5 shadow-inner text-center">
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">EURO</p>
                      <p className="text-4xl font-black tracking-tighter">€{convertHuf(hufAmount).eur}</p>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-background border border-white/5 shadow-inner text-center">
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">USD</p>
                      <p className="text-4xl font-black tracking-tighter">${convertHuf(hufAmount).usd}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
              <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 px-10 py-8">
                <CardTitle className="flex items-center gap-4 text-blue-500 text-2xl font-black uppercase italic tracking-tighter">
                  <Share2 size={32} />
                  QR Spot Share
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                {showQr ? (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-black/10">
                      <svg width="200" height="200" viewBox="0 0 160 160" className="mx-auto">
                        <rect width="160" height="160" fill="white" />
                        <rect x="20" y="20" width="40" height="40" fill="black" />
                        <rect x="100" y="20" width="40" height="40" fill="black" />
                        <rect x="20" y="100" width="40" height="40" fill="black" />
                        <rect x="35" y="35" width="10" height="10" fill="white" />
                        <rect x="115" y="35" width="10" height="10" fill="white" />
                        <rect x="35" y="115" width="10" height="10" fill="white" />
                        <rect x="70" y="70" width="20" height="20" fill="#ff0080" />
                        <rect x="100" y="100" width="10" height="10" fill="black" />
                        <rect x="130" y="130" width="10" height="10" fill="black" />
                      </svg>
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">SCAN TO FIND ME</p>
                    <Button variant="ghost" onClick={() => setShowQr(false)} className="text-[11px] uppercase font-black tracking-widest">Close Radar</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-medium text-muted-foreground mb-10 max-w-sm leading-relaxed italic opacity-80">Generate a local coordinate QR. Friends scan to save your tent instantly.</p>
                    <Button 
                      onClick={handleGenerateShareCode}
                      className="w-full h-24 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] text-xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                      GENERATE QR
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="survival" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-[2rem] bg-muted/20 p-2 h-20 border border-white/5 backdrop-blur-3xl mb-12">
              <TabsTrigger value="survival" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Tactical</TabsTrigger>
              <TabsTrigger value="culture" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Culture</TabsTrigger>
              <TabsTrigger value="safety" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Safety</TabsTrigger>
            </TabsList>

            <TabsContent value="survival" className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Card className="p-10 bg-card/50 border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden group backdrop-blur-3xl">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Sun size={160} />
                  </div>
                  <div className="flex items-start gap-8 relative z-10">
                    <div className="p-5 rounded-[2rem] bg-orange-500/10 text-orange-500 shadow-inner">
                      <Sun size={40} />
                    </div>
                    <div>
                      <h4 className="font-black text-2xl mb-3 uppercase italic tracking-tighter">UV Forecast</h4>
                      <p className="text-base font-medium text-muted-foreground leading-relaxed opacity-80">
                        Index: <span className="text-orange-500 font-black">HIGH (8)</span>. <br/>
                        Peak burn: 11:00 - 15:00. <br/>
                        Reapply sunscreen now.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-10 bg-card/50 border-white/5 rounded-[3.5rem] shadow-2xl backdrop-blur-3xl">
                  <div className="flex items-start gap-8">
                    <div className="p-5 rounded-[2rem] bg-emerald-500/10 text-emerald-500 shadow-inner">
                      <Weight size={40} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-2xl mb-4 uppercase italic tracking-tighter">Gear Loadout</h4>
                      <div className="space-y-4 mt-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Total Weight: {totalLoad}kg</p>
                        <div className="flex gap-3">
                          <Button size="sm" variant="secondary" className="h-12 text-[11px] font-black rounded-[1.2rem] flex-1 uppercase tracking-[0.2em]" onClick={() => setWeight(w => w + 1)}>+1kg</Button>
                          <Button size="sm" variant="ghost" className="h-12 text-[11px] font-black rounded-[1.2rem] uppercase tracking-[0.2em]" onClick={() => setWeight(8)}>Reset</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <Button onClick={toggleFlash} variant="destructive" className="w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-2xl shadow-2xl gap-6 transition-all hover:scale-[1.02] active:scale-95">
                <Zap size={32} />
                SOS BEACON
              </Button>
            </TabsContent>

            <TabsContent value="culture" className="space-y-10">
              <div className="flex items-center gap-6 mb-4">
                <Languages className="text-primary h-8 w-8" />
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">Hungarian Survival</h3>
              </div>
              <Card className="bg-card/50 border-white/5 rounded-[4rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {[
                      { h: 'Szia', e: 'Hello / Bye', p: 'See-ya' },
                      { h: 'Köszönöm', e: 'Thank you', p: 'Kuh-suh-num' },
                      { h: 'Egy sört kérek', e: 'A beer, please', p: 'Edge shirt kay-reck' },
                      { h: 'Hol van a víz?', e: 'Where is the water?', p: 'Hole vawn a veez?' },
                      { h: 'Egészségedre!', e: 'Cheers!', p: 'Ag-esh-shay-ge-dre' },
                      { h: 'Segítség!', e: 'Help!', p: 'She-geet-shaig!' },
                    ].map((item) => (
                      <div key={item.h} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all duration-500 group">
                        <div>
                          <p className="text-3xl font-black text-primary uppercase italic tracking-tighter leading-none mb-2 group-hover:scale-105 transition-transform">{item.h}</p>
                          <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">{item.e}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Phonetic</p>
                          <p className="text-lg font-bold italic text-foreground opacity-80">{item.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="space-y-10">
              <div className="grid grid-cols-1 gap-10">
                <Card className="p-12 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-500/30 rounded-[4rem] relative overflow-hidden">
                  <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12">
                    <ShieldCheck size={240} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-6">
                        <div className="bg-white/20 p-4 rounded-[2rem] shadow-inner">
                          <ShieldCheck size={48} />
                        </div>
                        <h4 className="font-black uppercase italic tracking-tighter text-4xl">Safe Check-In</h4>
                      </div>
                      {lastCheckIn && <div className="text-[11px] font-black uppercase tracking-[0.3em] bg-black/20 px-6 py-3 rounded-full backdrop-blur-3xl border border-white/10">Last: {lastCheckIn}</div>}
                    </div>
                    <p className="text-2xl font-medium opacity-90 mb-12 max-w-lg leading-relaxed italic">Instantly log your safety status during sets. Data stays 100% private on your device.</p>
                    <Button 
                      onClick={handleSafeCheckIn}
                      className="w-full h-24 rounded-[2rem] bg-white text-indigo-600 font-black uppercase tracking-[0.4em] text-2xl hover:bg-white/90 shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                      I AM SAFE
                    </Button>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Card className="p-10 bg-card/50 border-white/5 rounded-[3.5rem] shadow-2xl backdrop-blur-3xl">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-5 rounded-[2rem] bg-red-500/10 text-red-500 shadow-inner">
                        <Ear size={40} />
                      </div>
                      <h4 className="font-black text-2xl uppercase italic tracking-tighter">Audio Monitor</h4>
                    </div>
                    <div className="h-10 bg-muted/20 rounded-full overflow-hidden mb-6 shadow-inner p-1">
                      <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">EST. Exposure: 102dB</p>
                      <p className="text-[11px] font-black text-red-500 uppercase tracking-[0.3em] bg-red-500/10 px-5 py-2 rounded-full border border-red-500/20">Wear Earplugs</p>
                    </div>
                  </Card>

                  <Card className="p-10 bg-card/50 border-white/5 rounded-[3.5rem] shadow-2xl backdrop-blur-3xl">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="p-5 rounded-[2rem] bg-yellow-500/10 text-yellow-500 shadow-inner">
                        <FileText size={40} />
                      </div>
                      <h4 className="font-black text-2xl uppercase italic tracking-tighter">Lost Item Helper</h4>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-8 leading-relaxed italic opacity-80">Prepare tech metadata for official Sziget security or Police reports.</p>
                    <Button 
                      variant="outline" 
                      className="w-full h-16 rounded-[1.5rem] border-white/10 hover:bg-white/5 font-black uppercase tracking-[0.2em] text-[11px]"
                      onClick={() => {
                        toast({
                          title: "METADATA READY",
                          description: "Check your local 'Memories' log for the report template.",
                        });
                      }}
                    >
                      Generate Report Template
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
