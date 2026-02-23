import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Phone, Shield, Navigation } from 'lucide-react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Emergency Numbers',
  description: 'Important contact numbers for emergencies at Sziget Festival.',
};

export default function EmergencyPage() {
  const emergencyContacts = [
    { service: "General Emergency", number: "112", icon: HeartPulse },
    { service: "Ambulance", number: "104", icon: HeartPulse },
    { service: "Police", number: "107", icon: Shield },
    { service: "Sziget Security", number: "+36 1 123 4567", icon: Shield },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Emergency Info
        </h1>
        <p className="mt-2 text-muted-foreground">
          Stay safe. Every second counts.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {emergencyContacts.map(contact => (
          <Card key={contact.service} className="bg-destructive/10 border-destructive/30 overflow-hidden relative group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:scale-110 transition-transform">
              <contact.icon size={120} />
            </div>
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-destructive mb-1">{contact.service}</p>
                <p className="text-2xl font-black text-foreground">{contact.number}</p>
              </div>
              <Button asChild size="lg" className="rounded-2xl bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 h-14 w-14 p-0">
                <a href={`tel:${contact.number.replace(/\s/g, '')}`}>
                  <Phone className="h-6 w-6" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              First Aid Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>Main First Aid centers are located near the <strong>Main Entrance</strong> and the <strong>World Music Stage</strong>. They are marked with large red crosses and are illuminated at night.</p>
            <p>For minor issues, roaming "First Aid Scouts" move through the crowds. Flag them down if you need water, sunblock, or a band-aid.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
