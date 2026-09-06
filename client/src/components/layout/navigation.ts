import { LayoutDashboard, Dumbbell, Utensils } from 'lucide-react';

export const primaryNavigation = [
  { icon: LayoutDashboard, label: 'Today', path: '/dashboard' },
  { icon: Dumbbell, label: 'Train', path: '/workout' },
  { icon: Utensils, label: 'Nutrition', path: '/diet' },
];

export function isNavigationActive(pathname: string, path: string) {
  if (path === '/workout') return ['/workout', '/routines', '/exercises'].some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
  return pathname === path;
}
