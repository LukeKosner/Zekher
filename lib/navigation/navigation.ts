// lib/navigation.ts
// Unified navigation configuration for breadcrumbs and sidebar

import {
  MessagesSquare,
  LibraryBig,
  Info,
  Home,
  Server,
  type LucideIcon
} from "lucide-react";
// =============================================================================
// NAVIGATION CONSTANTS
// =============================================================================

import { NAVIGATION_SECTIONS, ROUTES } from "./constants";

import type { NavigationItem } from "./types";

// Re-export constants and types for backward compatibility
export { NAVIGATION_SECTIONS, ROUTES };
export type { NavigationItem } from "./types";

import { NAVIGATION_CONFIG } from "./config";

export function getNavigationItemByPath(
  path: string
): NavigationItem | undefined {
  // Handle special redirects
  if (path === ROUTES.DEVELOPERS) {
    return NAVIGATION_CONFIG.find(
      (item) => item.href === ROUTES.DEVELOPERS_MCP
    );
  }

  // Exact match first
  const exactMatch = NAVIGATION_CONFIG.find((item) => item.href === path);
  if (exactMatch) return exactMatch;

  // For sub-pages, find the closest parent
  if (path !== ROUTES.HOME) {
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
      return { section: NAVIGATION_SECTIONS.UNKNOWN, label };
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
