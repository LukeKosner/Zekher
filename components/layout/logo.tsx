"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export function Logo() {
  return (
    <Link href="/">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Image
              src="/android-chrome-512x512.png"
              alt="Zekher logo"
              width={32}
              height={32}
              className="size-8 object-contain rounded-lg"
              priority
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Zekher</span>
              <span className="truncate text-xs">Holocaust Tools for AI</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Link>
  );
}
