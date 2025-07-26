/**
 * Static TestimonyCarousel (no text truncation)
 */

"use client";

import {
  Users,
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
import { useState } from "react";
import Link from "next/link";

interface TestimonyEntry {
  id?: string;
  survivorName: string;
  excerpt: string;
  fullTranscript?: string;
  location?: string;
  timeReference?: string;
  filename: string;
  url?: string;
}
interface TestimonyCarouselProps {
  status: "result" | "loading";
  name: string;
  sources: TestimonyEntry[];
}

/* ───── Helpers ───── */
const TIMESTAMP_RE = /\[(\d{2}:\d{2}:\d{2})]/g;
const SEGMENT_LIMIT = 6;

const parseSegments = (txt = "") => {
  const segs: { stamp: string; text: string }[] = [];
  let m,
    last = 0;
  while ((m = TIMESTAMP_RE.exec(txt)) && segs.length < SEGMENT_LIMIT) {
    if (segs.length)
      segs[segs.length - 1].text = txt.slice(last, m.index).trim();
    segs.push({ stamp: m[1], text: "" });
    last = m.index + m[0].length;
  }
  if (segs.length) segs[segs.length - 1].text = txt.slice(last).trim();
  return segs.filter((s) => s.text);
};

/* ───── Component ───── */
export const TestimonyCarousel = ({
  status,
  name,
  sources
}: TestimonyCarouselProps) => {
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
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">{name}</span>
          <Badge className="rounded-full text-xs" variant="secondary">
            {status === "result" ? (
              <CheckCircleIcon className="size-4 text-green-600" />
            ) : (
              <ClockIcon className="size-4 animate-pulse" />
            )}
            {status === "result" ? "Completed" : "Finding testimonies…"}
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

      {status === "result" && (
        <CollapsibleContent className="overflow-hidden border-t p-4">
          <Carousel className="relative mx-auto w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {sources.map((t, i) => {
                const segs = parseSegments(t.fullTranscript || "");
                const fileLink = `/sources/testimony/${t.filename}`;

                return (
                  <CarouselItem
                    key={t.id || i}
                    className="pl-2 md:pl-4 basis-full xl:basis-1/2"
                  >
                    {/* Card */}
                    <div className="rounded-md border h-56 overflow-y-auto p-3 bg-muted/30">
                      <h3 className="text-sm font-semibold">
                        {t.survivorName}
                      </h3>
                      {(t.location || t.timeReference) && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {t.location}
                          {t.location && t.timeReference && " • "}
                          {t.timeReference}
                        </p>
                      )}

                      {segs.length ? (
                        segs.map((s, idx) => (
                          <div key={idx} className="mb-3">
                            <span className="font-mono text-blue-600 text-xs">
                              [{s.stamp}]
                            </span>
                            <p className="pl-2 mt-1 text-xs leading-relaxed whitespace-pre-wrap border-l border-muted-foreground/40">
                              {s.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {t.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Citation links */}
                    <div className="mt-2 pt-2">
                      <p className="text-xs text-gray-500 text-center">
                        {t.url && (
                          <>
                            <Link
                              href={t.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors"
                            >
                              David P. Boder Collection
                            </Link>
                          </>
                        )}
                        {" • "}
                        <Link
                          href={fileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors underline"
                        >
                          Full Testimony
                          <ExternalLink className="inline size-3 ml-1" />
                        </Link>
                      </p>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious
              aria-label="Previous"
              className="!left-2 md:!left-4 !bottom-8 z-10 size-8 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </CarouselPrevious>
            <CarouselNext
              aria-label="Next"
              className="!right-2 md:!right-4 !bottom-8 z-10 size-8 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </CarouselNext>
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
