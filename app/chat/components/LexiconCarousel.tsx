/**
 * Ultra‑compact LexiconCarousel
 * – cropped preview
 * – inline links: “Source ⋅ View Full Document ↗”
 */

"use client";

import {
  BookOpenCheck,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink
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
import { useState, useRef, useEffect } from "react";
import { generateSourceUrl } from "@/lib";
import Link from "next/link";
import type { LexiconCarouselEntry, LexiconCarouselProps } from "../types";

export const LexiconCarousel = ({
  status,
  name,
  sources
}: LexiconCarouselProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const objectRefs = useRef<(HTMLObjectElement | null)[]>([]);

  // Function to refresh objects with better mobile support
  const refreshObjects = () => {
    objectRefs.current.forEach((obj) => {
      if (obj && obj.data) {
        try {
          // For mobile browsers, force a complete reload
          const currentData = obj.data;
          if (currentData) {
            // Add timestamp to force reload
            const separator = currentData.includes("?") ? "&" : "?";
            const newData = `${currentData}${separator}_t=${Date.now()}`;
            obj.data = newData;
          }
        } catch (e) {
          // Fallback: traditional refresh method
          const currentData = obj.data;
          obj.data = "";
          requestAnimationFrame(() => {
            obj.data = currentData;
          });
        }
      }
    });
  };

  // Force object refresh when collapsible opens/closes
  useEffect(() => {
    if (isOpen) {
      // Longer delay for mobile to ensure DOM is stable
      const timer = setTimeout(refreshObjects, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Listen for window resize events
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isOpen) {
          refreshObjects();
        }
      }, 500); // Longer delay for mobile
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isOpen]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="not-prose mb-4 w-full rounded-md border"
    >
      {/* Header */}
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
          <Carousel className="relative mx-auto w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {sources.map((src, i) => {
                const citationUrl = generateSourceUrl({
                  pageType: "lexicon",
                  filename: src.filename
                });
                return (
                  <CarouselItem
                    key={src.id || i}
                    className="pl-2 md:pl-4 basis-full xl:basis-1/2"
                  >
                    {/* Cropped PDF preview */}
                    <Link
                      href={citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md border overflow-hidden h-56 cursor-pointer hover:opacity-90 transition-opacity relative"
                    >
                      {src.pdfUrl ? (
                        <object
                          ref={(el) => { objectRefs.current[i] = el; }}
                          data={`${src.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          type="application/pdf"
                          className="absolute inset-0 h-full w-full border-0 pointer-events-none"
                          title="PDF preview"
                          aria-label="PDF preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            containIntrinsicSize: '100% 100%'
                          }}
                        >
                          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground px-4 text-center">
                            PDF preview not available
                          </div>
                        </object>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground px-4 text-center">
                          PDF not available
                        </div>
                      )}
                    </Link>

                    {/* Citation links */}
                    <div className="mt-2 pt-2 ">
                      <p className="text-xs text-gray-500 text-center">
                        <Link
                          href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className=" transition-colors"
                        >
                          Yad Vashem
                        </Link>
                        {" • "}
                        <Link
                          href={citationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors underline"
                        >
                          Full Document
                          <ExternalLink className="inline size-3 ml-1" />
                        </Link>
                      </p>
                    </div>
                  </CarouselItem>
                );
              })}
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
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
