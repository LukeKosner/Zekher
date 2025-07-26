/**
 * Navigation and routing type definitions
 */

import { type LucideIcon } from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
  breadcrumbLabel?: string;
  section: string;
}