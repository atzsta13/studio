import { IconName } from "@/components/ui/icon";
import { FestivalConfig, getFestivalConfig } from "@/config/festival-engine";

export interface NavItem {
  href: string;
  label: string;
  tKey: string;
  icon: IconName;
  feature?: keyof FestivalConfig['features'];
}

export const getNavItems = (festivalId: string | undefined): NavItem[] => {
  const config = getFestivalConfig(festivalId);
  const prefix = festivalId ? `/${festivalId}` : '';

  const items: NavItem[] = [
    { href: `${prefix}/`, label: 'Home', tKey: 'nav_home', icon: 'home' },
    { href: `${prefix}/discover`, label: 'Artists', tKey: 'nav_artists', icon: 'wand-2' },
    { href: `${prefix}/highlights`, label: 'Wrap', tKey: 'nav_highlights', icon: 'trophy' },
    { href: `${prefix}/map`, label: 'Map', tKey: 'nav_map', icon: 'map', feature: 'weatherRadar' },
    { href: `${prefix}/tools`, label: 'Tools', tKey: 'nav_tools', icon: 'zap' },
  ];

  return items.filter(item => {
    if (!item.feature) return true;
    return config.features[item.feature];
  });
};

// Keep legacy export for now to avoid breaking builds during refactor
export const navItems = getNavItems(process.env.NEXT_PUBLIC_FESTIVAL_ID);
