// components/sidebar/SidebarSection.tsx
// Server Component for static sidebar sections

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import type { SidebarItem, SidebarSectionProps } from "../types";

export function SidebarSection({
  title,
  items,
  activePathChecker
}: SidebarSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={activePathChecker(item.href)}
              >
                <Link href={item.href}>
                  <IconComponent />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
