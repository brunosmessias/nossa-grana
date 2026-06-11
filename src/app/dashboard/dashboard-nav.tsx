"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Tag,
  Users,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/contas", icon: Wallet, label: "Contas" },
  { href: "/dashboard/categorias", icon: Tag, label: "Categorias" },
  { href: "/dashboard/transacoes", icon: ArrowLeftRight, label: "Transações" },
  { href: "/dashboard/familia", icon: Users, label: "Família" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-1">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={pathname === item.href}
            tooltip={item.label}
            render={<Link href={item.href} />}
          >
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
