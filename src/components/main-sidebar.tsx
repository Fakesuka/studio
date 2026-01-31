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
  ScrollText,
  Store,
  User,
  Settings,
  Gift,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Панель управления', icon: LayoutDashboard },
    { href: '/orders', label: 'Мои заказы', icon: ScrollText },
    { href: '/marketplace', label: 'Маркетплейс', icon: Store },
    { href: '/bonuses', label: 'Бонусы', icon: Gift },
    { href: '/profile', label: 'Профиль', icon: User },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.png" alt="YakGo" width={120} height={36} priority />
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
