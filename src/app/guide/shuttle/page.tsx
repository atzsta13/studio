import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shuttle Bus Info',
  description: 'All you need to know about the Sziget shuttle buses.',
};

export default function ShuttlePage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Shuttle Bus Information
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your ride to and from the Island of Freedom.
        </p>
      </header>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Bus className="h-6 w-6" />
            Key Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-card-foreground/90">
          <div>
            <h3 className="font-bold">Airport Transfer</h3>
            <p>Shuttle buses run directly from Liszt Ferenc International Airport (BUD) to the festival entrance. Busses are available 24/7 during the festival period, typically starting two days before the festival and ending one day after.</p>
          </div>
          <div>
            <h3 className="font-bold">City Center Line</h3>
            <p>A dedicated bus line often runs from major transport hubs in Budapest, like Deák Ferenc tér, directly to the festival. Check the official Sziget website for the exact route and timetable for 2026.</p>
          </div>
          <div>
            <h3 className="font-bold">Tickets &amp; Pricing</h3>
            <p>Shuttle bus tickets can usually be purchased online in advance (often at a discount) or directly from the driver. A CityPass may include free use of the shuttle services.</p>
          </div>
          <div>
            <h3 className="font-bold">Tip</h3>
            <p>To avoid long queues, try to travel outside of peak hours (mid-day arrivals, and late-night departures from the island).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
