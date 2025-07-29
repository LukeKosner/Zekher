import { useState, useRef, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel as UICarousel,
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

export function Carousel({ name, status, icon, children }: any) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="not-prose mb-4 w-full rounded-md border"
    >
      {/* Header */}
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{name}</span>
          <Badge className="rounded-full text-xs" variant="secondary">
            {status === "result" ? (
              <CheckCircleIcon className="size-4 text-green-600" />
            ) : (
              <ClockIcon className="size-4 animate-pulse" />
            )}
            {status === "result" ? "Completed" : "Searching…"}
          </Badge>
        </div>
        {status === "result" && (
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </CollapsibleTrigger>

      {/* Body */}
      {status === "result" && (
        <CollapsibleContent className="overflow-hidden border-t p-4">
          <UICarousel className="relative mx-auto w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {children}
            </CarouselContent>

            {/* Navigation */}
            <CarouselPrevious
              aria-label="Previous"
              className="!left-2 md:!left-4 !bottom-8 z-10 size-9 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </CarouselPrevious>
            <CarouselNext
              aria-label="Next"
              className="!right-2 md:!right-4 !bottom-8 z-10 size-9 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </CarouselNext>
          </UICarousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}