import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tent } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Camping Rules',
  description: 'Official rules and guidelines for camping at Sziget.',
};

export default function CampingPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Camping Rules & Guidelines
        </h1>
        <p className="mt-2 text-muted-foreground">
          Respect the island, respect each other.
        </p>
      </header>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Tent className="h-6 w-6" />
            General Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-card-foreground">Tent Placement</AccordionTrigger>
              <AccordionContent className="text-card-foreground/80">
                You can set up your tent in any of the designated basic camping areas. Do not block pathways or emergency routes. Respect the space of your neighbors.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-card-foreground">Prohibited Items</AccordionTrigger>
              <AccordionContent className="text-card-foreground/80">
                Open fires, gas canisters (larger than 250g), generators, and glass bottles are strictly forbidden. Security will confiscate these items at the entrance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-card-foreground">Valuables</AccordionTrigger>
              <AccordionContent className="text-card-foreground/80">
                Do not leave valuables unattended in your tent. Use the on-site locker services for secure storage of your passport, wallet, and electronics.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-card-foreground">Cleanliness</AccordionTrigger>
              <AccordionContent className="text-card-foreground/80">
                Keep your camping spot clean. Use the provided trash bags and recycling points. A clean island is a happy island!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
