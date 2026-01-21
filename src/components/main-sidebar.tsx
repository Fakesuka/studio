'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Wrench,
  ScrollText,
  Store,
  User,
  Settings,
  LogOut,
  Car,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Панель управления', icon: LayoutDashboard },
    { href: '/services/new', label: 'Новый запрос', icon: Wrench },
    { href: '/orders', label: 'Мои заказы', icon: ScrollText },
    { href: '/marketplace', label: 'Маркетплейс', icon: Store },
    { href: '/profile', label: 'Профиль', icon: User },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Car className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Vroom</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Настройки', side: 'right' }}>
              <Settings />
              <span>Настройки</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/">
                <SidebarMenuButton tooltip={{ children: 'Выйти', side: 'right' }}>
                <LogOut />
                <span>Выйти</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
