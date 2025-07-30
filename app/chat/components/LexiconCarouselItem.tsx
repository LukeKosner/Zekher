"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CarouselItem as UICarouselItem } from "@/components/ui/carousel";
import { generateSourceUrl } from "@/lib";
import type { LexiconCarouselEntry } from "../types";

export const LexiconCarouselItem = ({
  source,
  index,
  basisClass = "basis-full xl:basis-1/2"
}: {
  source: LexiconCarouselEntry;
  index: number;
  basisClass?: string;
}) => {
  const [txtPreview, setTxtPreview] = useState("");

  useEffect(() => {
    if (source.txtUrl && !source.pdfUrl) {
      fetch(source.txtUrl)
        .then((res) => (res.ok ? res.text() : ""))
        .then((text) => {
          setTxtPreview(text.slice(0, 500));
        })
        .catch((error) => {
          console.warn("Failed to fetch text preview:", error);
          setTxtPreview(""); // Silently fail for preview
        });
    }
  }, [source.txtUrl, source.pdfUrl]);

  // Generate the internal citation URL for navigating to the lexicon page
  const internalUrl = source.id
    ? generateSourceUrl({
        pageType: "lexicon",
        filename: source.id
      })
    : "#";

  return (
    <UICarouselItem
      key={source.id || index}
      className={`pl-2 md:pl-4 ${basisClass}`}
    >
      {/* Cropped preview - navigate to lexicon page */}
      <Link
        href={internalUrl}
        className="block rounded-md border overflow-hidden h-56 cursor-pointer hover:opacity-90 transition-opacity relative"
      >
        {source.pdfUrl ? (
          <object
            data={`${source.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
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
          <div className="h-full w-full overflow-y-auto bg-muted/30 p-3">
            <h3 className="text-sm font-semibold">{source.title}</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-2">
              {txtPreview}
              {txtPreview.length === 500 ? "..." : ""}
            </p>
          </div>
        )}
      </Link>

      {/* Citation links */}
      <div className="mt-2 pt-2">
        <p className="text-xs text-gray-500 text-center">
          <Link
            href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
          >
            Yad Vashem
          </Link>
          {" • "}
          <Link href={internalUrl} className="transition-colors underline">
            View Entry
            <ExternalLink className="inline size-3 ml-1" />
          </Link>
        </p>
      </div>
    </UICarouselItem>
  );
};
