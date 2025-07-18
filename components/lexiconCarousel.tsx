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
import { getLexiconUrl } from "@/lib/utils/blob-urls";
import { generateSourceUrl } from "@/lib/utils/url-generation";

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

export const LexiconCarousel = ({
  status,
  name,
  sources
}: LexiconCarouselProps) => {
  const [isOpen, setIsOpen] = useState(true);

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
              {sources.map((source, index) => (
                <CarouselItem key={source.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative group/pdf-item" title={`${source.title} - Source: Holocaust Lexicon`}>
                      <iframe
                        src={`${getLexiconUrl(source.filename)}#toolbar=0&navpanes=0&scrollbar=0`}
                        width="100%"
                        height="400px"
                        className="border-0 rounded-md"
                        title={`PDF: ${source.title}`}
                      >
                        <div className="p-4 text-center">
                          <h3 className="text-xl font-semibold mb-2">
                            {source.title}
                          </h3>
                          <p>
                            PDF could not be loaded.{" "}
                            <a
                              href={getLexiconUrl(source.filename)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Download PDF
                            </a>
                          </p>
                        </div>
                      </iframe>
                      
                      {/* Updated overlay with less aggressive darkening and info display */}
                      <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover/pdf-item:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center rounded-md pointer-events-none">
                        {/* Title and source info */}
                        <div className="bg-white bg-opacity-95 text-black px-3 py-2 rounded-lg mb-3 max-w-[90%] text-center shadow-lg">
                          <div className="font-semibold text-sm truncate">{source.title}</div>
                          <div className="text-xs text-gray-600">Holocaust Lexicon</div>
                        </div>
                        
                        {/* Action button */}
                        <a
                          href={getLexiconUrl(source.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors pointer-events-auto shadow-lg"
                        >
                          <ExternalLink className="size-4" />
                          Read in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 md:left-4" />
            <CarouselNext className="right-0 md:right-4" />
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
