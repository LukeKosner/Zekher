// components/sidebar/SidebarFooter.tsx
// Client Component for responsive footer content

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarFooterContent() {
  const { open } = useSidebar();

  return <div className="flex justify-center p-2"></div>;
}
