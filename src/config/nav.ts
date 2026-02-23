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
  { href: '/tools', label: 'Tools', icon: 'gavel' },
  { href: '/passport', label: 'Stamps', icon: 'sparkles' },
  { href: '/timetable', label: 'Time', icon: 'calendar-days' },
];
