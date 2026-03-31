import { IconName } from "@/components/ui/icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/discover', label: 'Artists', icon: 'wand-2' },
  { href: '/map', label: 'Map', icon: 'map' },
  { href: '/merch', label: 'Merch', icon: 'shopping-bag' },
  { href: '/passport', label: 'Passport', icon: 'trophy' },
  { href: '/tools', label: 'Tools', icon: 'zap' },
];
