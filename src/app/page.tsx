import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, CalendarDays, LifeBuoy, Music } from 'lucide-react';

const features = [
  {
    title: 'Full Schedule',
    description: 'Plan your festival day by day',
    href: '/schedule',
    icon: CalendarDays,
  },
  {
    title: 'Interactive Map',
    description: 'Find your way around the island',
    href: '/map',
    icon: Map,
  },
  {
    title: 'Survival Guide',
    description: 'Essential tips and info',
    href: '/guide',
    icon: LifeBuoy,
  },
];

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="text-center">
        <div className="inline-block rounded-full bg-primary/20 p-4">
          <Music className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-4 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Sziget Insider 2026
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Your unofficial offline-first companion for the Island of Freedom.
          All features work without an internet connection.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Link href={feature.href} key={feature.title}>
            <Card className="h-full transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-background p-3">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
                <CardDescription className="mt-2 text-card-foreground/80">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
