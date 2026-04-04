import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Train, Ship, Info } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { FESTIVAL } from '@/config/festival';

export const metadata: Metadata = {
  title: 'Shuttle & Transport',
  description: `All you need to know about ${FESTIVAL.name} transport and travel.`,
};

const transportItems = [
  { title: "Festival Boat", desc: `Direct boat sets running from the city center to the island. Check the schedule for sunset sets.`, icon: Ship },
  { title: "Public Transport", desc: "Available 24/7 during the festival. Night buses run every 10-15 minutes.", icon: Bus },
  { title: "HÉV Train (Line 5)", desc: "The fastest way to reach the island from Batthyány tér. Use the Filatorigát stop.", icon: Train },
];

export default function ShuttlePage() {
  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <PageHeader 
        title="Transport Guide" 
        description={`Getting to and from ${FESTIVAL.name} safely and efficiently.`}
      />

      <div className="grid gap-8 mt-12">
        {transportItems.map((item) => (
          <Card key={item.title} className="bg-card/50 border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl">
            <div className="flex items-start gap-8">
              <div className="p-5 rounded-2xl bg-secondary/10 text-secondary">
                <item.icon size={32} />
              </div>
              <div>
                <h3 className="font-black text-2xl uppercase italic tracking-tighter mb-2">{item.title}</h3>
                <p className="text-lg font-medium text-muted-foreground leading-relaxed opacity-80 italic">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}

        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-[3rem] p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500 rounded-full">
              <Info className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-400">Tactical Tip</h2>
          </div>
          <p className="text-xl font-medium text-blue-100/80 leading-relaxed italic">
            The CityPass includes ALL public transport, the airport shuttle, and the boat service for free. 
            It also gives you discounts at local thermal baths and beaches. Pick one up at the airport or the entrance.
          </p>
        </div>
      </div>
    </div>
  );
}
