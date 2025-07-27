// components/sidebar/SidebarSection.tsx
// Client Component for mobile sidebar close functionality

"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { SheetClose } from "@/components/ui/sheet";
import { LucideIcon } from "lucide-react";
import type { SidebarItem, SidebarSectionProps } from "../types";

export function SidebarSection({
  title,
  items,
  activePathChecker
}: SidebarSectionProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = item.icon;
          const linkContent = (
            <Link href={item.href}>
              <IconComponent />
              <span>{item.label}</span>
            </Link>
          );

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={activePathChecker(item.href)}
              >
                {isMobile ? (
                  <SheetClose asChild>
                    {linkContent}
                  </SheetClose>
                ) : (
                  linkContent
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
