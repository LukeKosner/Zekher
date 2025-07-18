// components/sidebar/SidebarNavigation.tsx
// Client Component for active path detection

"use client";

import { usePathname } from "next/navigation";
import { MessagesSquare, Database, Code, BookOpen } from "lucide-react";
import { SidebarSection } from "./Section";

const EVERYONE_ITEMS = [
  { href: "/chat", icon: MessagesSquare, label: "Chat" },
  { href: "/sources", icon: Database, label: "Sources" }
];

const DEVELOPERS_ITEMS = [
  { href: "/developers", icon: Code, label: "Get Started" },
  { href: "/documentation", icon: BookOpen, label: "Documentation" }
];

export function SidebarNavigation() {
  const pathname = usePathname();

  // Helper function to determine if a path is active
  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <SidebarSection
        title="Everyone"
        items={EVERYONE_ITEMS}
        activePathChecker={isActivePath}
      />
      <SidebarSection
        title="Developers"
        items={DEVELOPERS_ITEMS}
        activePathChecker={isActivePath}
      />
    </>
  );
}
