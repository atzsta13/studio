import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Phone, Shield, Navigation } from 'lucide-react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { FESTIVAL } from '@/config/festival-engine';

export const metadata: Metadata = {
  title: 'Emergency & Safety',
  description: `Important contact numbers for emergencies at ${FESTIVAL.name} Festival.`,
};

const contacts = [
  { service: `${FESTIVAL.name} Security`, number: "+36 1 123 4567", icon: Shield },
  { service: "Medical Emergency", number: "+36 1 765 4321", icon: HeartPulse },
  { service: "General SOS", number: "112", icon: Phone },
];

export default function EmergencyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <PageHeader 
        title="Emergency Info" 
        description="Available 24/7 on-site. These numbers work even without a data connection."
      />

      <div className="grid gap-6 mt-12">
        {contacts.map((c) => (
          <Card key={c.service} className="bg-card/50 border-white/5 overflow-hidden rounded-[2rem]">
            <div className="flex items-center justify-between p-8">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                  <c.icon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase italic tracking-tight">{c.service}</h3>
                  <p className="font-mono text-2xl font-bold text-muted-foreground">{c.number}</p>
                </div>
              </div>
              <Button asChild className="rounded-xl font-black px-8">
                <a href={`tel:${c.number.replace(/\s/g, '')}`}>DIAL</a>
              </Button>
            </div>
          </Card>
        ))}

        <Card className="mt-8 bg-primary/5 border-primary/10 rounded-[2.5rem] p-10">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-3 font-black italic uppercase text-2xl tracking-tighter">
              <Navigation />
              Main Medical Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg font-medium opacity-80 leading-relaxed italic">
            <p>The main medical center is located near the <strong>Main Stage Left</strong>. It is staffed by professional doctors and paramedics 24 hours a day.</p>
            <p>Pharmacy services are available at the City Center pharmacy, open from 08:00 to 20:00. Note that specialized medication may require a prescription and can only be obtained at night.</p>
            <p>For minor issues, roaming "First Aid Scouts" move through the crowds. Flag them down if you need water, sunblock, or a band-aid.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
