'use client';
import { BASE_PATH } from '@/lib/base-path';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tent, 
  Bus, 
  Coins, 
  ShieldCheck, 
  Droplets, 
  ShoppingBag, 
  Clock, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface SurvivalData {
  camping: {
    basic: string;
    upgraded: Array<{ name: string; price: string; features: string[] }>;
    deposit: string;
  };
  transport: {
    shuttleBoat: {
      route: string;
      schedule: string;
      price: string;
    };
    publicTransport: {
      train: string;
      cityPass: string;
    };
  };
  pricing: {
    drinks: Array<{ item: string; price: string }>;
    food: Array<{ item: string; price: string }>;
    dailyBudget: string;
  };
  safety: {
    medical: string;
    payments: string;
    grocery: string;
  };
}

export function SurvivalGuide() {
  const { festivalId } = useParams() as { festivalId: string };
  const [data, setData] = useState<SurvivalData | null>(null);
  const [expanded, setExpanded] = useState<string | null>('camping');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${BASE_PATH}/data/${festivalId}/survival.json`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load survival guide', err);
      }
    }
    fetchData();
  }, [festivalId]);

  if (!data) return null;

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  interface SectionProps {
    id: string;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    colorClass: string;
  }
  const Section = ({ id, title, icon: Icon, children, colorClass }: SectionProps) => (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[2rem] mb-6">
      <button 
        onClick={() => toggle(id)}
        className="w-full text-left"
      >
        <CardHeader className={`${colorClass} border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between`}>
          <CardTitle className="flex items-center gap-4 text-white text-xl font-black uppercase italic tracking-tighter">
            <Icon size={24} />
            {title}
          </CardTitle>
          {expanded === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </CardHeader>
      </button>
      {expanded === id && (
        <CardContent className="p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
          {children}
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Section id="camping" title="Camping & Sleep" icon={Tent} colorClass="bg-blue-600/20">
        <div>
          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-3">Basic Access</h4>
          <p className="text-muted-foreground italic font-medium leading-relaxed">{data.camping.basic}</p>
        </div>
        <div className="space-y-4">
          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-400">Upgrades</h4>
          {data.camping.upgraded.map((u, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black uppercase italic tracking-tight">{u.name}</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400/30">{u.price}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.features.map((f, fi) => (
                  <span key={fi} className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-white/5 px-2 py-1 rounded-md">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
          <Info className="text-orange-500 shrink-0" size={18} />
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-tight leading-snug">
            {data.camping.deposit}
          </p>
        </div>
      </Section>

      <Section id="transport" title="Transport" icon={Bus} colorClass="bg-emerald-600/20">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Bus size={20} /></div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-1">Shuttle Boat</h4>
              <p className="font-bold text-sm">{data.transport.shuttleBoat.route}</p>
              <p className="text-xs text-muted-foreground italic">{data.transport.shuttleBoat.schedule}</p>
              <p className="text-xs font-black text-emerald-500 mt-1 uppercase">{data.transport.shuttleBoat.price}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-white/5 pt-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><Clock size={20} /></div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Public Transport</h4>
              <p className="font-bold text-sm">{data.transport.publicTransport.train}</p>
              <p className="text-xs text-muted-foreground italic mt-2">{data.transport.publicTransport.cityPass}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="pricing" title="Budgets & Prices" icon={Coins} colorClass="bg-yellow-600/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-yellow-400">Drinks</h4>
            {data.pricing.drinks.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">{d.item}</span>
                <span className="font-black italic">{d.price}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-yellow-400">Food</h4>
            {data.pricing.food.map((f, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">{f.item}</span>
                <span className="font-black italic">{f.price}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Estimated Daily Budget</p>
           <p className="text-3xl font-black italic tracking-tighter text-white">{data.pricing.dailyBudget}</p>
        </div>
      </Section>

      <Section id="safety" title="Safety & Support" icon={ShieldCheck} colorClass="bg-red-600/20">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><ShieldCheck size={20} /></div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-red-400 mb-1">Medical</h4>
              <p className="font-medium text-sm italic">{data.safety.medical}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-white/5 pt-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><Droplets size={20} /></div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Payments</h4>
              <p className="font-medium text-sm italic">{data.safety.payments}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-white/5 pt-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><ShoppingBag size={20} /></div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-1">Grocery</h4>
              <p className="font-medium text-sm italic">{data.safety.grocery}</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
