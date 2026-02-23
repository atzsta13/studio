import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Plane, Ship, MapPin, Ticket } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shuttle & Boat Info',
  description: 'All you need to know about Sziget transport, including the CityPass and Boat Parties.',
};

export default function ShuttlePage() {
  const routes = [
    { title: "Airport (BUD) Express", desc: "Runs 24/7 during the festival. Direct from Terminal 2 to the H-Bridge entrance. Free with CityPass.", icon: Plane },
    { title: "Sziget Cruisin' Boat", desc: "Danube boat sets running from Batthyány tér to the island. Check the schedule for sunset sets.", icon: Ship },
    { title: "City Center Line", desc: "Every 15-20 mins from Deák Ferenc tér to Filatorigát station via H5 HÉV train.", icon: Bus },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Island Transit
        </h1>
        <p className="mt-2 text-muted-foreground">
          Getting to and from the Island of Freedom.
        </p>
      </header>

      <div className="space-y-4">
        {routes.map(route => (
          <Card key={route.title} className="bg-card/50 border-border/50 overflow-hidden group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2 relative">
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <route.icon size={20} />
              </div>
              <CardTitle className="text-lg">{route.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{route.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20 overflow-hidden relative">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
          <Ticket size={160} />
        </div>
        <CardContent className="p-8 relative z-10">
          <h3 className="font-black text-2xl flex items-center gap-3 mb-4 uppercase italic italic tracking-tight">
            <Ticket size={24} />
            The CityPass
          </h3>
          <p className="text-sm font-medium opacity-90 leading-relaxed mb-6">
            The Sziget CityPass by BKK includes ALL public transport, the airport shuttle, and the Sziget Boat service for free. It also gives you discounts at Budapest’s thermal baths and beaches.
          </p>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Insider Tip</p>
            <p className="text-xs font-bold italic">Pick yours up at the airport or Deák Ferenc tér before your first ride!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
