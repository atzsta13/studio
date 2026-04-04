import { IconName } from "@/components/ui/icon";
import { FESTIVAL, FESTIVAL_CONFIGS, FestivalConfig, getFestivalConfig } from "@/config/festival";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  feature?: keyof FestivalConfig['features'];
}

export const getNavItems = (festivalId: string | undefined): NavItem[] => {
  const config = getFestivalConfig(festivalId);
  const prefix = festivalId ? `/${festivalId}` : '';

  const items: NavItem[] = [
    { href: `${prefix}/`, label: 'Home', icon: 'home' },
    { href: `${prefix}/discover`, label: 'Artists', icon: 'wand-2' },
    { href: `${prefix}/map`, label: 'Map', icon: 'map', feature: 'weatherRadar' },
    { href: `${prefix}/merch`, label: 'Merch', icon: 'shopping-bag', feature: 'merchCatalog' },
    { href: `${prefix}/passport`, label: 'Passport', icon: 'trophy', feature: 'passport' },
    { href: `${prefix}/tools`, label: 'Tools', icon: 'zap' },
  ];

  return items.filter(item => {
    if (!item.feature) return true;
    return config.features[item.feature];
  });
};

// Keep legacy export for now to avoid breaking builds during refactor
export const navItems = getNavItems(process.env.NEXT_PUBLIC_FESTIVAL_ID);
