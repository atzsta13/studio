import {
    Sparkles, HeartPulse, Gavel, Home, CalendarDays, Wand2, Map, LifeBuoy, Camera
} from 'lucide-react';

export type IconName = 'sparkles' | 'heart-pulse' | 'gavel' | 'home' | 'calendar-days' | 'wand-2' | 'map' | 'life-buoy' | 'camera';

interface IconProps extends React.HTMLAttributes<SVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  const LucideIcon = {
    sparkles: Sparkles,
    'heart-pulse': HeartPulse,
    gavel: Gavel,
    home: Home,
    'calendar-days': CalendarDays,
    'wand-2': Wand2,
    map: Map,
    'life-buoy': LifeBuoy,
    camera: Camera
  }[name] || Sparkles;

  return <LucideIcon size={size} {...props} />;
}
