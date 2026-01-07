import type { Metadata } from 'next';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { MapPin } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Home, Music, Droplets, Utensils, HeartPulse, Tent } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Map',
  description: 'Interactive map of Sziget Festival. Find stages, restrooms, and other points of interest.',
};

const pins: MapPin[] = [
  { id: 'main-stage', label: 'Main Stage', type: 'stage', position: { top: '50%', left: '30%' } },
  { id: 'a38', label: 'A38 Stage', type: 'stage', position: { top: '35%', left: '60%' } },
  { id: 'dance-arena', label: 'Dance Arena', type: 'stage', position: { top: '70%', left: '75%' } },
  { id: 'water-1', label: 'Water Point', type: 'water', position: { top: '45%', left: '45%' } },
  { id: 'water-2', label: 'Water Point', type: 'water', position: { top: '65%', left: '65%' } },
  { id: 'toilet-1', label: 'Restrooms', type: 'toilet', position: { top: '42%', left: '50%' } },
  { id: 'first-aid', label: 'First Aid', type: 'first-aid', position: { top: '80%', left: '20%' } },
  { id: 'camping', label: 'Basic Camping', type: 'camping', position: { top: '20%', left: '20%' } },
];

const pinIcons = {
  stage: Music,
  water: Droplets,
  toilet: Home, // Using Home as a proxy for facilities
  'first-aid': HeartPulse,
  camping: Tent,
};

const pinColors = {
    stage: 'bg-primary text-primary-foreground',
    water: 'bg-blue-500 text-white',
    toilet: 'bg-yellow-500 text-black',
    'first-aid': 'bg-red-500 text-white',
    camping: 'bg-green-600 text-white',
};

export default function MapPage() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <header className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Island Map
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the festival grounds. Click on pins for details.
        </p>
      </header>
      <div className="mt-8 w-full overflow-hidden rounded-lg border-4 border-primary shadow-2xl">
        <TooltipProvider>
            <div className="relative w-full aspect-[4/3]">
                {mapImage && (
                    <Image
                    src={mapImage.imageUrl}
                    alt={mapImage.description}
                    data-ai-hint={mapImage.imageHint}
                    fill
                    className="object-cover"
                    />
                )}
                {pins.map(pin => {
                    const Icon = pinIcons[pin.type];
                    return (
                    <Tooltip key={pin.id}>
                        <TooltipTrigger asChild>
                        <div
                            className={cn(
                                'absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transform transition-transform hover:scale-125 hover:z-10',
                                pinColors[pin.type]
                            )}
                            style={{ top: pin.position.top, left: pin.position.left }}
                        >
                            <Icon className="w-5 h-5" />
                        </div>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>{pin.label}</p>
                        </TooltipContent>
                    </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
