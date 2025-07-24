// lib/navigation.ts
// Unified navigation configuration for breadcrumbs and sidebar

import {
  MessagesSquare,
  Database,
  Info,
  Home,
  Server,
  type LucideIcon
} from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
  breadcrumbLabel?: string;
  section: string;
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  // Project section
  {
    href: "/",
    icon: Home,
    label: "Home",
    breadcrumbLabel: "Home",
    section: "Project"
  },
  {
    href: "/about",
    icon: Info,
    label: "About",
    breadcrumbLabel: "About",
    section: "Project"
  },

  // Everyone section
  {
    href: "/chat",
    icon: MessagesSquare,
    label: "Chat",
    breadcrumbLabel: "Chat",
    section: "Everyone"
  },
  {
    href: "/sources",
    icon: Database,
    label: "Sources",
    breadcrumbLabel: "Sources",
    section: "Everyone"
  },
  // Developers section
  {
    href: "/developers/mcp",
    icon: Server,
    label: "MCP",
    breadcrumbLabel: "MCP",
    section: "Developers"
  }
];

export function getNavigationItemByPath(
  path: string
): NavigationItem | undefined {
  // Handle special redirects
  if (path === "/developers") {
    return NAVIGATION_CONFIG.find((item) => item.href === "/developers/mcp");
  }

  // Exact match first
  const exactMatch = NAVIGATION_CONFIG.find((item) => item.href === path);
  if (exactMatch) return exactMatch;

  // For sub-pages, find the closest parent
  if (path !== "/") {
    const segments = path.split("/").filter(Boolean);

    // Try progressively shorter paths
    for (let i = segments.length; i > 0; i--) {
      const testPath = `/${segments.slice(0, i).join("/")}`;
      const match = NAVIGATION_CONFIG.find((item) => item.href === testPath);
      if (match) return match;
    }
  }

  return undefined;
}

export function generateBreadcrumb(
  path: string
): { section: string; label: string } | null {
  const navigationItem = getNavigationItemByPath(path);

  if (!navigationItem) {
    // Fallback for unknown paths
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      const label = segments[segments.length - 1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { section: "Unknown", label };
    }
    return null;
  }

  return {
    section: navigationItem.section,
    label: navigationItem.breadcrumbLabel || navigationItem.label
  };
}

export function getNavigationItemsBySection(section: string): NavigationItem[] {
  return NAVIGATION_CONFIG.filter((item) => item.section === section);
}

export function getAllSections(): string[] {
  return [...new Set(NAVIGATION_CONFIG.map((item) => item.section))];
}
