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
  Ear,
  Sun,
  FileText,
  Phone,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  MapPin,
  Share2,
  Languages
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeatherWidget } from '@/components/tools/weather-widget';
import { HungarianPhrases } from '@/components/tools/hungarian-phrases';
import { CampsiteChecklist } from '@/components/tools/campsite-checklist';

export default function ToolsPage() {
  const { toast } = useToast();
  const [hufAmount, setHufAmount] = useState<string>('1000');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showQr, setShowQr] = useState(false);

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
          </div>

          <Tabs defaultValue="survival" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-[2rem] bg-muted/20 p-2 h-20 border border-white/5 backdrop-blur-3xl mb-12">
              <TabsTrigger value="survival" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Tactical</TabsTrigger>
              <TabsTrigger value="safety" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Safety</TabsTrigger>
              <TabsTrigger value="phrases" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Phrases</TabsTrigger>
              <TabsTrigger value="camp" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Camp</TabsTrigger>
            </TabsList>

            <TabsContent value="survival" className="space-y-10">
              <WeatherWidget />
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
                        Index: <span className="text-orange-500 font-black">HIGH (8)</span>. <br />
                        Peak burn: 11:00 - 15:00. <br />
                        Reapply sunscreen now.
                      </p>
                    </div>
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
              <Button onClick={toggleFlash} variant="destructive" className="mt-8 w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-2xl shadow-2xl gap-6 transition-all hover:scale-[1.02] active:scale-95">
                <Zap size={32} />
                SOS BEACON
              </Button>
            </TabsContent>

            <TabsContent value="safety" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="p-10 bg-red-600 border-none shadow-2xl rounded-[3.5rem] relative overflow-hidden text-white backdrop-blur-3xl group cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <div className="absolute right-[-20px] top-[-20px] opacity-20 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldAlert size={160} />
                  </div>
                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-start gap-8">
                      <div className="p-5 rounded-[2rem] bg-white/20 text-white shadow-inner mb-6">
                        <ShieldAlert size={40} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-4xl mb-4 uppercase italic tracking-tighter">Security Alert</h4>
                      <p className="text-lg font-medium opacity-90 leading-relaxed italic mb-8">Tap to instantly dial the festival main security dispatch. Have your location ready.</p>
                      <Button variant="secondary" className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-lg text-red-600 bg-white hover:bg-white/90">
                        DIAL SECURITY
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-10 bg-blue-600 border-none shadow-2xl rounded-[3.5rem] relative overflow-hidden text-white backdrop-blur-3xl group cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                  <div className="absolute right-[-20px] top-[-20px] opacity-20 group-hover:scale-110 transition-transform duration-1000">
                    <Phone size={160} />
                  </div>
                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-start gap-8">
                      <div className="p-5 rounded-[2rem] bg-white/20 text-white shadow-inner mb-6">
                        <Phone size={40} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-4xl mb-4 uppercase italic tracking-tighter">Medical Help</h4>
                      <p className="text-lg font-medium opacity-90 leading-relaxed italic mb-8">Tap to instantly dial the on-site emergency medical responders. Available 24/7.</p>
                      <Button variant="secondary" className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-lg text-blue-600 bg-white hover:bg-white/90">
                        DIAL MEDICAL
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="phrases" className="space-y-10">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6">
                  Essential Hungarian for the Island
                </p>
                <HungarianPhrases />
              </div>
            </TabsContent>

            <TabsContent value="camp" className="space-y-10">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6">
                  Campsite Readiness Checklist
                </p>
                <CampsiteChecklist />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
