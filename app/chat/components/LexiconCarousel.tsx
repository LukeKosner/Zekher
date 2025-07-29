/**
 * Ultra‑compact LexiconCarousel
 * – cropped preview
 * – inline links: “Source ⋅ View Full Document ↗”
 */

import { BookOpenCheck, ExternalLink } from "lucide-react";
import { Carousel } from "./Carousel";
import { LexiconCarouselItem } from "./LexiconCarouselItem";
import type { LexiconCarouselEntry, LexiconCarouselProps } from "../types";

export const LexiconCarousel = ({
  status,
  name,
  sources
}: LexiconCarouselProps) => {
  return (
    <Carousel
      name={name}
      status={status}
      icon={<BookOpenCheck className="size-4 text-muted-foreground" />}
    >
      {sources?.length ? sources.map((src, i) => (
        <LexiconCarouselItem key={src.id || i} source={src} index={i} />
      )) : <div>No sources available</div>}
    </Carousel>
  );
};
