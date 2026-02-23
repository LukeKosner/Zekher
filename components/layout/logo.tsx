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
              src="/zekher-logo.png"
              alt="Zekher logo"
              width={512}
              height={512}
              className="size-8 object-contain rounded-lg"
              quality={100}
              priority
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                Zekher <span className="text-muted-foreground">Beta</span>
              </span>
              <span className="truncate text-xs">Holocaust Tools for AI</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Link>
  );
}
