import { IconName } from "@/components/ui/icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/schedule', label: 'Schedule', icon: 'calendar-days' },
  { href: '/packing-list', label: 'Packing List', icon: 'wand-2' },
  { href: '/food', label: 'Food & Drink', icon: 'map' },
  { href: '/guide', label: 'Guide', icon: 'life-buoy' },
];
