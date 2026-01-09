import {
    Sparkles, HeartPulse, Gavel, Home, CalendarDays, Wand2, Map, LifeBuoy
} from 'lucide-react';

export type IconName = 'sparkles' | 'heart-pulse' | 'gavel' | 'home' | 'calendar-days' | 'wand-2' | 'map' | 'life-buoy';

interface IconProps extends React.HTMLAttributes<SVGElement> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = {
    sparkles: Sparkles,
    'heart-pulse': HeartPulse,
    gavel: Gavel,
    home: Home,
    'calendar-days': CalendarDays,
    'wand-2': Wand2,
    map: Map,
    'life-buoy': LifeBuoy
  }[name];

  return <LucideIcon {...props} />;
}
