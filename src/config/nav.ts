import { IconName } from "@/components/ui/icon";
import { FESTIVAL, FestivalConfig } from "@/config/festival";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  feature?: keyof FestivalConfig['features'];
}

const allNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/discover', label: 'Artists', icon: 'wand-2' },
  { href: '/map', label: 'Map', icon: 'map', feature: 'weatherRadar' }, // Map is almost always true, but we could use a better flag
  { href: '/merch', label: 'Merch', icon: 'shopping-bag', feature: 'merchCatalog' },
  { href: '/passport', label: 'Passport', icon: 'trophy', feature: 'passport' },
  { href: '/tools', label: 'Tools', icon: 'zap' },
];

export const navItems = allNavItems.filter(item => {
  if (!item.feature) return true;
  return FESTIVAL.features[item.feature];
});
