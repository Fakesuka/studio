import {
  LayoutDashboard,
  Store,
  User,
  Bell,
  ListChecks,
} from 'lucide-react';

export const bottomMenuItems = [
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/profile', label: 'Профиль', icon: User },
];

export const driverBottomMenuItems = [
  { href: '/driver/history', label: 'История', icon: ListChecks },
  { href: '/driver/dashboard', label: 'Новые', icon: Bell },
  { href: '/driver/profile', label: 'Профиль', icon: User },
];
