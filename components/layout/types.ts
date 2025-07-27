/**
 * Layout component type definitions
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Props for the SidebarStateManager component
 */
export interface SidebarStateManagerProps {
  children: ReactNode;
}

/**
 * Props for the RouteSlugGenerator component
 */
export interface RouteSlugGeneratorProps {
  children: (slug: string) => ReactNode;
}

/**
 * Props for the ConditionalTitle component
 */
export interface ConditionalTitleProps {
  sidebarOpen?: boolean;
  isMobile?: boolean;
  title: string;
}

/**
 * Sidebar item interface
 */
export interface SidebarItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Props for the SidebarSection component
 */
export interface SidebarSectionProps {
  title: string;
  items: SidebarItem[];
  activePathChecker: (path: string) => boolean;
}

/**
 * Props for the BreadcrumbNavigation component
 */
export interface BreadcrumbNavigationProps {
  slug: string;
}
