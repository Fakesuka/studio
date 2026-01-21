import {
  LayoutDashboard,
  ScrollText,
  Store,
  User,
  Bell,
  ListChecks,
} from 'lucide-react';

export const bottomMenuItems = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/orders', label: 'Заказы', icon: ScrollText },
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/profile', label: 'Профиль', icon: User },
];

export const driverBottomMenuItems = [
  { href: '/driver/dashboard', label: 'Заказы', icon: Bell },
  { href: '/driver/history', label: 'История', icon: ListChecks },
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/driver/profile', label: 'Профиль', icon: User },
];
