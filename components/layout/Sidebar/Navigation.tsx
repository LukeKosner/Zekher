// components/sidebar/SidebarNavigation.tsx
// Client Component for active path detection

"use client";

import { usePathname } from "next/navigation";
import { SidebarSection } from "./Section";
import { getNavigationItemsBySection, getAllSections } from "@/lib/navigation";
import { ROUTES } from "@/lib/navigation/constants";

export function SidebarNavigation() {
  const pathname = usePathname();

  // Helper function to determine if a path is active
  const isActivePath = (path: string) => {
    if (path === ROUTES.CLASSROOM_STUDENT) {
      return (
        pathname.startsWith(ROUTES.CLASSROOM_STUDENT) ||
        pathname.startsWith("/classroom/session")
      );
    }

    if (path === ROUTES.CLASSROOM_TEACHER) {
      return pathname.startsWith(ROUTES.CLASSROOM_TEACHER);
    }

    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const sections = getAllSections();

  return (
    <>
      {sections.map((section) => (
        <SidebarSection
          key={section}
          title={section}
          items={getNavigationItemsBySection(section)}
          activePathChecker={isActivePath}
        />
      ))}
    </>
  );
}
