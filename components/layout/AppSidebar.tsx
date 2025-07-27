"use client";

import * as React from "react";
import { Logo } from "@/components/layout/logo";
import { SidebarNavigation } from "@/components/layout/Sidebar/Navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { SidebarFooterContent } from "./Sidebar/Footer";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      {!isMobile && (
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}