/**
 * Lexicon Carousel Component
 * 
 * Displays lexicon entries in a carousel format with interactive cards.
 * Uses the new LexiconCard component with hover overlays for better UX.
 */

"use client";

import {
  BookOpenCheck,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { useState } from "react";
import { LexiconCard } from "./LexiconCard";
import { sourcesPageConstants } from "@/lib/prompts";
import { LexiconSource } from "@/lib/types";

interface LexiconEntry {
  id?: string;
  title: string;
  filename: string;
}

interface LexiconCarouselProps {
  status: string;
  name: string;
  sources: LexiconEntry[];
}

/**
 * Converts LexiconEntry to LexiconSource for card component
 */
function convertToLexiconSource(entry: LexiconEntry, index: number): LexiconSource {
  return {
    id: entry.id || `lexicon-${index}`,
    filename: entry.filename,
    title: entry.title,
    description: `${sourcesPageConstants.lexiconOverlay.title} entry: ${entry.title}`,
    featured: false
  };
}

export const LexiconCarousel = ({
  status,
  name,
  sources
}: LexiconCarouselProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { loadingStates } = sourcesPageConstants;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="not-prose mb-4 w-full rounded-md border"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">{name}</span>
          <Badge className="rounded-full text-xs" variant="secondary">
            {status === "result" ? (
              <CheckCircleIcon className="size-4 text-green-600" />
            ) : (
              <ClockIcon className="size-4 animate-pulse" />
            )}
            {status === "result" ? "Completed" : loadingStates.searching}
          </Badge>
        </div>
        {status === "result" && (
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </CollapsibleTrigger>
      {status === "result" && (
        <CollapsibleContent className="grid gap-4 overflow-hidden border-t p-4 text-sm">
          <Carousel className="w-full max-w-full mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {sources.map((source, index) => {
                const lexiconSource = convertToLexiconSource(source, index);
                return (
                  <CarouselItem key={source.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <LexiconCard 
                        source={lexiconSource}
                        className="h-[300px] flex flex-col"
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 md:left-4" />
            <CarouselNext className="right-0 md:right-4" />
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
