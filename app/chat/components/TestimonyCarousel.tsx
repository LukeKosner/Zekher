/**
 * Static TestimonyCarousel (no text truncation)
 */

import { Users, ExternalLink } from "lucide-react";
import { Carousel } from "./Carousel";
import { CarouselItem } from "@/components/ui/carousel";
import Link from "next/link";
import type { TestimonyCarouselEntry, TestimonyCarouselProps } from "../types";

/* ───── Helpers ───── */
const TIMESTAMP_RE = /[\[](\d{2}:\d{2}:\d{2})]/g;
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
  return (
    <Carousel
      name={name}
      status={status}
      icon={<Users className="size-4 text-muted-foreground" />}
    >
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
              <h3 className="text-sm font-semibold">{t.survivorName}</h3>
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
    </Carousel>
  );
};
