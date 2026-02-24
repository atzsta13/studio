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
  { href: '/guide', label: 'Guide', icon: 'calendar-days' },
  { href: '/tools', label: 'Tools', icon: 'gavel' },
  { href: '/memories', label: 'Log', icon: 'sparkles' },
];
