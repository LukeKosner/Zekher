/**
 * Shared component type definitions
 */

import type { ReactNode } from "react";

/**
 * Props for the LazyLoadWrapper component
 */
export interface LazyLoadWrapperProps {
  children: ReactNode;
  placeholder: ReactNode;
}

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

/**
 * State for the ErrorBoundary component
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

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
  id: string;
  title: string;
  children: (slug: string) => ReactNode;
}
