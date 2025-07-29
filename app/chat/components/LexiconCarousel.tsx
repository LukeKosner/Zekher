/**
 * Ultra‑compact LexiconCarousel
 * – cropped preview
 * – inline links: “Source ⋅ View Full Document ↗”
 */

import { BookOpenCheck, ExternalLink } from "lucide-react";
import { Carousel } from "./Carousel";
import { CarouselItem } from "@/components/ui/carousel";
import { generateSourceUrl } from "@/lib";
import Link from "next/link";
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
                  data={`${src.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  type="application/pdf"
                  className="absolute inset-0 h-full w-full border-0 pointer-events-none"
                  title="PDF preview"
                  aria-label="PDF preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    containIntrinsicSize: "100% 100%"
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
    </Carousel>
  );
};
