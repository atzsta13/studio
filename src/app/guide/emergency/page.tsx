import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Numbers',
  description: 'Important contact numbers for emergencies at Sziget Festival.',
};

export default function EmergencyPage() {
  const emergencyContacts = [
    { service: "General Emergency", number: "112" },
    { service: "Ambulance", number: "104" },
    { service: "Police", number: "107" },
    { service: "Fire Department", number: "105" },
    { service: "Sziget Help Line", number: "+36 1 123 4567 (Example)" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Emergency Information
        </h1>
        <p className="mt-2 text-muted-foreground">
          Stay safe. Know who to call.
        </p>
      </header>

      <Card className="bg-destructive/20 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <HeartPulse className="h-6 w-6" />
            Important Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyContacts.map(contact => (
            <div key={contact.service} className="flex items-center justify-between p-3 rounded-md bg-background/50">
              <span className="font-medium text-foreground">{contact.service}</span>
              <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="flex items-center gap-2 font-bold text-lg text-primary">
                <Phone className="h-5 w-5" />
                {contact.number}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 text-muted-foreground space-y-2">
        <p><strong className="text-foreground">First Aid:</strong> There are multiple first aid stations marked on the map. Do not hesitate to visit them for any medical issue, big or small.</p>
        <p><strong className="text-foreground">Lost & Found:</strong> Located near the main entrance. If you lose or find something, please report it there.</p>
        <p><strong className="text-foreground">Stay Hydrated:</strong> Drink plenty of water. Free drinking water is available at points marked on the map.</p>
      </div>
    </div>
  );
}
