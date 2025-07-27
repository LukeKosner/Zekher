/**
 * UI component type definitions
 */

import type { ComponentProps, HTMLAttributes } from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType
} from "embla-carousel-react";
import type { Button } from "./button";

/**
 * Carousel API type
 */
export type CarouselApi = UseEmblaCarouselType[1];

/**
 * Carousel parameters type
 */
export type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;

/**
 * Carousel options type
 */
export type CarouselOptions = UseCarouselParameters[0];

/**
 * Carousel plugin type
 */
export type CarouselPlugin = UseCarouselParameters[1];

/**
 * Carousel props interface
 */
export interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

/**
 * Carousel context props interface
 */
export interface CarouselContextProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  opts?: CarouselOptions;
  orientation?: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

/**
 * Sidebar context props interface
 */
export interface SidebarContextProps {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

/**
 * Pagination link props interface
 */
export interface PaginationLinkProps
  extends Pick<React.ComponentProps<typeof Button>, "size">,
    React.ComponentProps<"a"> {
  isActive?: boolean;
}

/**
 * Auto-resize textarea props interface
 */
export interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}
