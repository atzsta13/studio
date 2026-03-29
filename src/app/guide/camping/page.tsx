import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tent, ShowerHead, Lock, FlameKindle } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { FESTIVAL } from '@/config/festival';

export const metadata: Metadata = {
  title: 'Camping Rules',
  description: `Official rules and guidelines for camping at ${FESTIVAL.name}.`,
};

const rules = [
  { title: "Tent Placement", desc: "Keep fire lanes clear. Security will ask you to move if you block paths.", icon: Tent },
  { title: "Showers & Hygiene", desc: "Free showers available in all camping zones. Peak hours are 08:00 - 11:00.", icon: ShowerHead },
  { title: "Valuables", desc: "Use the lockers at the City Center for passports and electronics. Don't leave tech in tents.", icon: Lock },
  { title: "No Open Fires", desc: "Gas stoves and open fires are strictly prohibited. Use the designated cooking areas.", icon: FlameKindle },
];

export default function CampingPage() {
  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <PageHeader 
        title="Camping Guide" 
        description={`Elite survival tips for living on the Island of Freedom.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {rules.map((rule) => (
          <Card key={rule.title} className="bg-card/50 border-white/5 rounded-[2.5rem] p-10 group hover:bg-card transition-colors duration-500">
            <div className="p-5 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit mb-6 group-hover:scale-110 transition-transform">
              <rule.icon size={32} />
            </div>
            <h3 className="font-black text-2xl uppercase italic tracking-tighter mb-3">{rule.title}</h3>
            <p className="text-base font-medium text-muted-foreground leading-relaxed opacity-80 italic">{rule.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 p-12 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center">
        <h2 className="text-2xl font-black uppercase italic tracking-widest mb-4">Quiet Zones</h2>
        <p className="text-muted-foreground italic text-lg max-w-2xl mx-auto">
          Respect your neighbors. Designated quiet zones are enforced from 03:00 to 08:00. 
          Use headphones if you're keeping the party going at your tent.
        </p>
      </div>
    </div>
  );
}
