/**
 * Chat Lexicon Carousel Component
 * 
 * Simple iframe-based carousel for chat interface - restores original UI
 */

"use client";

import {
  BookOpenCheck,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
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
import { generateSourceUrl } from "@/lib/utils/url-generation";

interface LexiconEntry {
  id?: string;
  title: string;
  filename: string;
  pdfUrl?: string | null;
}

interface LexiconCarouselProps {
  status: string;
  name: string;
  sources: LexiconEntry[];
}

export const LexiconCarousel = ({
  status,
  name,
  sources
}: LexiconCarouselProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Consistent text truncation function
  const truncateText = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
            {status === "result" ? "Completed" : "Searching historical records..."}
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
                // Use database pdfUrl for preview, but link to citation page
                const pdfUrl = source.pdfUrl;
                const citationUrl = generateSourceUrl({
                  pageType: "lexicon",
                  filename: source.filename // filename contains the correct lexicon source ID
                });
                
                return (
                  <CarouselItem key={source.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <a
                        href={citationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative group/pdf-item cursor-pointer"
                        title={`${source.title} - Source: Holocaust Lexicon`}
                      >
                        {pdfUrl ? (
                          <div className="relative w-full h-[400px] rounded-md overflow-hidden">
                            <iframe
                              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                              width="100%"
                              height="100%"
                              className="border-0 pointer-events-none transition-all duration-200 group-hover/pdf-item:brightness-75"
                              title={`PDF: ${source.title}`}
                            >
                              <div className="p-4 text-center">
                                <h3 className="text-xl font-semibold mb-2">
                                  {truncateText(source.title)}
                                </h3>
                                <p>
                                  PDF could not be loaded.{" "}
                                  <span className="text-blue-600 hover:text-blue-800 underline">
                                    View Full Entry
                                  </span>
                                </p>
                              </div>
                            </iframe>
                            
                            {/* Hover content overlay */}
                            <div className="absolute inset-0 group-hover/pdf-item:flex hidden flex-col items-center justify-center pointer-events-none transition-all duration-200">
                              {/* Content that appears on hover */}
                              <div className="flex flex-col items-center">
                                {/* Title and source info */}
                                <div className="bg-white bg-opacity-95 text-black px-3 py-2 rounded-lg mb-3 max-w-[90%] text-center shadow-lg">
                                  <div className="font-semibold text-sm">{truncateText(source.title)}</div>
                                  <div className="text-xs text-gray-600">Holocaust Lexicon</div>
                                </div>
                                
                                {/* Action button */}
                                <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium shadow-lg">
                                  <ExternalLink className="size-4" />
                                  View Full Entry
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-[400px] border-0 rounded-md bg-muted/30 flex items-center justify-center">
                            <div className="p-4 text-center">
                              <h3 className="text-xl font-semibold mb-2">
                                {truncateText(source.title)}
                              </h3>
                              <p className="text-muted-foreground">
                                PDF not available for this entry
                              </p>
                            </div>
                          </div>
                        )}
                      </a>
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