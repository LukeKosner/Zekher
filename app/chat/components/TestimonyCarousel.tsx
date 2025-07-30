/**
 * Static TestimonyCarousel (no text truncation)
 */

import { Users, ExternalLink, Languages } from "lucide-react";
import { Carousel } from "./Carousel";
import { CarouselItem } from "@/components/ui/carousel";
import Link from "next/link";
import type { TestimonyCarouselEntry, TestimonyCarouselProps } from "../types";

/* ───── Helpers ───── */
const TIMESTAMP_RE = /[\[](\d{2}:\d{2}:\d{2})]/g;
const SEGMENT_LIMIT = 6;

const parseSegments = (txt = "") => {
  const segs: { stamp: string; text: string }[] = [];
  const timestamps: { stamp: string; index: number }[] = [];
  let m;

  // First, collect all timestamps and their positions
  while ((m = TIMESTAMP_RE.exec(txt))) {
    timestamps.push({ stamp: m[1], index: m.index });
  }

  // If no timestamps, return empty
  if (timestamps.length === 0) return [];

  // Create segments by pairing each timestamp with the text that follows it,
  // until the next timestamp (or end of text)
  for (let i = 0; i < timestamps.length && segs.length < SEGMENT_LIMIT; i++) {
    const currentTimestamp = timestamps[i];
    const nextTimestamp = timestamps[i + 1];

    // Text starts after current timestamp and goes until next timestamp (or end)
    const textStart =
      currentTimestamp.index + `[${currentTimestamp.stamp}]`.length;
    const textEnd = nextTimestamp ? nextTimestamp.index : txt.length;
    const text = txt.slice(textStart, textEnd).trim();

    if (text) {
      segs.push({ stamp: currentTimestamp.stamp, text });
    }
  }

  return segs;
};

/**
 * Map language codes to human-readable names
 */
function getLanguageName(languageCode: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    pl: "Polish",
    cs: "Czech",
    hu: "Hungarian",
    ro: "Romanian",
    nl: "Dutch",
    sv: "Swedish",
    no: "Norwegian",
    da: "Danish",
    fi: "Finnish",
    el: "Greek",
    tr: "Turkish",
    uk: "Ukrainian",
    bg: "Bulgarian",
    hr: "Croatian",
    sk: "Slovak",
    sl: "Slovenian",
    lt: "Lithuanian",
    lv: "Latvian",
    et: "Estonian",
    he: "Hebrew",
    ar: "Arabic",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean"
  };

  // Handle the case where language is already a full name
  if (languageCode && languageCode.length > 3) {
    return languageCode;
  }

  const normalizedCode = languageCode?.toLowerCase().trim();
  return languageMap[normalizedCode] || languageCode || "Unknown";
}

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
      {sources.map((t: TestimonyCarouselEntry, i: number) => {
        const segs = parseSegments(t.excerpt || "");
        const fileLink = `/sources/testimony/${t.id}`;

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

              {/* Language warning */}
              {t.language &&
                t.language.toLowerCase() !== "english" &&
                getLanguageName(t.language).toLowerCase() !== "english" && (
                  <div className="px-2 py-1 mb-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <Languages className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                      <span className="text-amber-800 dark:text-amber-200 font-medium">
                        Snippet is in {getLanguageName(t.language)}
                      </span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300 text-xs">
                      Finding audio segments now—Zekher will provide a machine
                      translation. If you'd prefer to read the full transcript,
                      please visit the Boder Collection.
                    </p>
                  </div>
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
                  {t.excerpt.slice(0, 280)}
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
                      className="transition-colors underline"
                    >
                      David P. Boder Collection
                      <ExternalLink className="inline size-3 ml-1" />
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
