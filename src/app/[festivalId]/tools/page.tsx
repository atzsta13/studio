'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Coins,
  Zap,
  Ear,
  Sun,
  Phone,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Bus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeatherWidget } from '@/components/tools/weather-widget';
import { WeatherRadar } from '@/components/tools/weather-radar';
import { HungarianPhrases } from '@/components/tools/hungarian-phrases';
import { CampsiteChecklist } from '@/components/tools/campsite-checklist';
import { HydrationTracker } from '@/components/tools/hydration-tracker';
import { BudgetTracker } from '@/components/tools/budget-tracker';
import { NotesJournal } from '@/components/tools/notes-journal';
import { SOSMorse } from '@/components/tools/sos-morse';
import { FeedbackSystem } from '@/components/tools/feedback-system';
import { CarFinder } from '@/components/tools/car-finder';
import { SurvivalGuide } from '@/components/tools/survival-guide';
import { useParams } from 'next/navigation';
import { getFestivalConfig } from '@/config/festival-engine';
import { useInsider } from '@/components/layout/insider-provider';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard, NeonButton } from '@/components/ui/brutalist';

import { FestivalLayoutShell } from '@/components/layout/festival-layout-shell';

export default function ToolsPage() {
  const { festivalId } = useParams() as { festivalId: string };
  const config = getFestivalConfig(festivalId);
  const { toast } = useToast();
  const { batterySaver, toggleBatterySaver: toggleBattery } = useInsider();
  const { t } = useTranslation();
  const [localAmount, setLocalAmount] = useState<string>(config.currency.localCode === 'HUF' ? '1000' : '10');
  const [isFlashOn, setIsFlashOn] = useState(false);

  const convertCurrency = (amount: string) => {
    const val = parseFloat(amount) || 0;
    return {
      eur: (val / config.currency.eurRate).toFixed(2),
      usd: (val / config.currency.usdRate).toFixed(2)
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

  if (isFlashOn) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-10 animate-pulse">
        <button
          onClick={toggleFlash}
          className="rounded-full h-56 w-56 border-[16px] border-black text-black font-black text-5xl uppercase shadow-2xl flex items-center justify-center bg-transparent transition-transform hover:scale-110 active:scale-95"
        >
          OFF
        </button>
        <p className="mt-16 text-black font-black text-7xl text-center uppercase italic tracking-tighter leading-none">Find Me!</p>
      </div>
    );
  }

  return (
    <FestivalLayoutShell
      headerTitle={t('toolkit_title') !== 'toolkit_title' ? t('toolkit_title') : 'Survival Toolkit'}
      headerSubtitle={`Elite tactical utilities for the ${config.tagline}. No signal required.`}
      headerIcon={Zap}
    >
      <div className="max-w-5xl mx-auto">

          {config.features.sunscreenAlert && (
            <GlassCard className="mb-10 bg-orange-500 text-black border-none p-6 flex items-center gap-6 animate-in slide-in-from-top-4 duration-1000" hoverEffect={false}>
               <div className="p-4 bg-black/10 rounded-2xl">
                 <Sun size={32} />
               </div>
               <div className="flex-1">
                 <p className="font-black uppercase tracking-widest text-[10px] mb-1">UV Alert</p>
                 <p className="font-bold text-lg leading-tight">Extreme Exposure. Reapply SPF 50 now.</p>
               </div>
               <button className="rounded-full h-12 w-12 border-2 border-black/20 p-0 font-black text-lg flex items-center justify-center hover:bg-black/5">✕</button>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            {config.features.hydrationTracker && (
              <HydrationTracker />
            )}

            {config.features.currencyConverter && (
              <GlassCard className="overflow-hidden" variant="secondary">
                <div className="bg-emerald-500/10 border-b border-emerald-500/10 px-10 py-8">
                  <h3 className="flex items-center gap-4 text-emerald-500 text-2xl font-black uppercase italic tracking-tighter">
                    <Coins size={32} />
                    {config.currency.localCode} Converter
                  </h3>
                </div>
                <div className="p-10">
                  <div className="space-y-8">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-3 block">{config.currency.localName} ({config.currency.localCode})</label>
                      <Input
                        type="number"
                        value={localAmount}
                        onChange={(e) => setLocalAmount(e.target.value)}
                        className="h-20 text-4xl font-black bg-muted/20 border-none rounded-[1.5rem] px-8 shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-[1.5rem] bg-background border border-white/5 shadow-inner text-center">
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">EURO</p>
                        <p className="text-4xl font-black tracking-tighter">€{convertCurrency(localAmount).eur}</p>
                      </div>
                      <div className="p-6 rounded-[1.5rem] bg-background border border-white/5 shadow-inner text-center">
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">USD</p>
                        <p className="text-4xl font-black tracking-tighter">${convertCurrency(localAmount).usd}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          <Tabs defaultValue="survival" className="w-full">
            <TabsList className={`grid w-full rounded-[2rem] bg-muted/20 p-2 h-20 border border-white/5 backdrop-blur-3xl mb-12 ${config.location.countryCode === 'HU' ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="survival" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">{t('toolkit_tactical') !== 'toolkit_tactical' ? t('toolkit_tactical') : 'Tactical'}</TabsTrigger>
              <TabsTrigger value="guide" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Guide</TabsTrigger>
              <TabsTrigger value="safety" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">{t('toolkit_safety') !== 'toolkit_safety' ? t('toolkit_safety') : 'Safety'}</TabsTrigger>
              {config.location.countryCode === 'HU' && (
                <TabsTrigger value="phrases" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Phrases</TabsTrigger>
              )}
              <TabsTrigger value="camp" className="rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-background data-[state=active]:shadow-2xl data-[state=active]:scale-105">Camp</TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="space-y-10">
              <SurvivalGuide />
            </TabsContent>

            <TabsContent value="survival" className="space-y-10">
              <WeatherWidget />
              {config.features.weatherRadar && <WeatherRadar />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {config.features.budgetTracker && <BudgetTracker />}
                {config.features.notesJournal && <NotesJournal />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {config.features.carFinder && <CarFinder />}
                <GlassCard className="p-10 relative overflow-hidden group">
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
                </GlassCard>

                {config.features.audioMonitor && (
                  <GlassCard className="p-10">
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
                  </GlassCard>
                )}
              </div>

              {config.features.sosMorseCode && <SOSMorse />}

              {config.features.batterySaver && (
                <GlassCard className="p-10 mt-10">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-[2rem] ${batterySaver ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'} shadow-inner`}>
                        <Zap size={40} />
                      </div>
                      <div>
                        <h4 className="font-black text-2xl uppercase italic tracking-tighter">Battery Saver</h4>
                        <p className="text-sm font-medium text-muted-foreground opacity-60 italic leading-snug">Disables animations and effects to save power.</p>
                      </div>
                    </div>
                    <NeonButton 
                      onClick={toggleBattery}
                      variant={batterySaver ? "accent" : "outline"}
                      className="h-16 px-10"
                    >
                      {batterySaver ? 'ENABLED' : 'ACTIVATE'}
                    </NeonButton>
                  </div>
                </GlassCard>
              )}
              
              <NeonButton onClick={toggleFlash} className="mt-8 w-full h-24 text-2xl gap-6" variant="white">
                <Zap size={32} />
                SOS BEACON
              </NeonButton>
            </TabsContent>

            <TabsContent value="safety" className="space-y-10">
              {config.features.feedbackSystem && <FeedbackSystem />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {config.content.emergencyContacts?.security && (
                  <GlassCard 
                    onClick={() => window.location.href = `tel:${config.content.emergencyContacts?.security.phone}`}
                    className="p-10 bg-red-600 border-none text-white group cursor-pointer"
                    hoverEffect={true}
                  >
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
                        <p className="text-lg font-medium opacity-90 leading-relaxed italic mb-8">Tap to instantly dial the {config.content.emergencyContacts.security.label}. Have your location ready.</p>
                        <NeonButton variant="white" className="w-full h-16 text-lg text-red-600">
                          DIAL SECURITY
                        </NeonButton>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {config.content.emergencyContacts?.medical && (
                  <GlassCard 
                    onClick={() => window.location.href = `tel:${config.content.emergencyContacts?.medical.phone}`}
                    className="p-10 bg-blue-600 border-none text-white group cursor-pointer"
                    hoverEffect={true}
                  >
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
                        <p className="text-lg font-medium opacity-90 leading-relaxed italic mb-8">Tap to instantly dial the {config.content.emergencyContacts.medical.label}. Available 24/7.</p>
                        <NeonButton variant="white" className="w-full h-16 text-lg text-blue-600">
                          DIAL MEDICAL
                        </NeonButton>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>

              {config.features.shuttleTimetable && (
                <Link href={`/${festivalId}/tools/shuttle`} className="block mt-10">
                  <GlassCard className="p-10 border-emerald-500/20 hover:bg-emerald-600/10 group" variant="secondary">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="p-5 rounded-[2rem] bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shadow-inner"><Bus size={40} /></div>
                          <div>
                             <h4 className="font-black text-2xl uppercase italic tracking-tighter text-emerald-400">Shuttle Timetable</h4>
                             <p className="text-sm font-medium text-emerald-400/60 italic leading-snug">Official routes and airport connection schedules.</p>
                          </div>
                       </div>
                       <ArrowRight className="text-emerald-400/40 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </GlassCard>
                </Link>
              )}

              {config.features.festivalDictionary && (
                <Link href={`/${festivalId}/tools/dictionary`} className="block mt-10">
                  <GlassCard className="p-10 border-indigo-500/20 hover:bg-indigo-600/10 group">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="p-5 rounded-[2rem] bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform shadow-inner"><BookOpen size={40} /></div>
                          <div>
                             <h4 className="font-black text-2xl uppercase italic tracking-tighter text-indigo-400">Festival Dictionary</h4>
                             <p className="text-sm font-medium text-indigo-400/60 italic leading-snug">Master the local island terminology and slang.</p>
                          </div>
                       </div>
                       <ArrowRight className="text-indigo-400/40 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </GlassCard>
                </Link>
              )}
            </TabsContent>

            {config.location.countryCode === 'HU' && (
              <TabsContent value="phrases" className="space-y-10">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6">
                    Essential Hungarian for the Island
                  </p>
                  <HungarianPhrases />
                </div>
              </TabsContent>
            )}

            <TabsContent value="camp" className="space-y-10">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-6">
                  Campsite Readiness Checklist
                </p>
                <CampsiteChecklist />
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </FestivalLayoutShell>
  );
}
