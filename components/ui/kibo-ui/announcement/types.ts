/**
 * Announcement component type definitions
 */

import type { ComponentProps, HTMLAttributes } from "react";
import type { Badge } from "@/components/ui/badge";

/**
 * Announcement props
 */
export type AnnouncementProps = ComponentProps<typeof Badge> & {
  themed?: boolean;
};

/**
 * Announcement tag props
 */
export type AnnouncementTagProps = HTMLAttributes<HTMLDivElement>;

/**
 * Announcement title props
 */
export type AnnouncementTitleProps = HTMLAttributes<HTMLDivElement>;
