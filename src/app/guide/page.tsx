import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bus, Tent, HeartPulse, ChevronRight, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Survival Guide',
  description: 'Essential tips, rules, and emergency information for Sziget Festival.',
};


const guideSections = [
  {
    title: 'Shuttle Bus Info',
    description: 'Schedules and pickup locations.',
    href: '/guide/shuttle',
    icon: Bus,
  },
  {
    title: 'Camping Rules',
    description: 'Know the dos and don\'ts.',
    href: '/guide/camping',
    icon: Tent,
  },
  {
    title: 'Emergency Numbers',
    description: 'Stay safe and get help if needed.',
    href: '/guide/emergency',
    icon: HeartPulse,
  },
  {
    title: 'Health & Safety',
    description: 'Tips for a safe and enjoyable festival.',
    href: '/guide/health',
    icon: ShieldCheck,
  },
];

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Survival Guide
        </h1>
        <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
          Everything you need to know for a smooth festival experience.
        </p>
      </header>
      <div className="mt-12 space-y-4">
        {guideSections.map((section) => (
          <Link href={section.href} key={section.title}>
            <Card className="transition-all duration-300 hover:bg-card/80 hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <section.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg text-card-foreground">{section.title}</CardTitle>
                    <CardDescription className="text-card-foreground/80">{section.description}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-card-foreground/50" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
