import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Plane, Train, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shuttle Bus Info',
  description: 'All you need to know about the Sziget shuttle buses.',
};

export default function ShuttlePage() {
  const routes = [
    { title: "Airport (BUD) Express", desc: "Runs 24/7 during the festival. Direct from Terminal 2 to the H-Bridge entrance.", icon: Plane },
    { title: "City Center Line", desc: "Every 15-20 mins from Deák Ferenc tér to Filatorigát station.", icon: Bus },
    { title: "Night Bus Line", desc: "Special night routes run from 01:00 to 05:00 to major hostel hubs.", icon: Bus },
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
          <Card key={route.title} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
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

      <Card className="mt-8 bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-2">
            <MapPin size={18} />
            Insider Tip
          </h3>
          <p className="text-sm text-blue-300/80">
            The Sziget CityPass by BKK includes all public transport and shuttle services for free. We highly recommend activating it before your first ride to the island.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
