/**
 * @fileoverview Sources page component for displaying Holocaust Lexicon and Testimony sources.
 * Handles server-side data fetching, formatting, and rendering with proper loading states.
 */

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sources - Zekher",
  description:
    "Browse Yad Vashem's Holocaust Lexicon entries and David P. Boder's survivor interview collection. Comprehensive Holocaust education resources.",
  keywords: [
    "Holocaust sources",
    "Yad Vashem Lexicon",
    "David Boder interviews",
    "Holocaust testimonies",
    "Holocaust education",
    "survivor stories"
  ],
  openGraph: {
    title: "Sources - Zekher",
    description:
      "Browse Yad Vashem's Holocaust Lexicon entries and David P. Boder's survivor interview collection.",
    type: "website"
  }
};

import { Suspense } from "react";
import type { JSX } from "react";
import { SourcesPageContent } from "./components/SourcesPageContent";
import { SourcesPageFallback } from "./components/skeletons";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { LexiconSource, TestimonySource } from "./types";
import { sourcesPageConstants } from "./config";

/**
 * Utility function to convert null values to undefined for UI consistency.
 * Database returns null for optional fields, but UI components expect undefined.
 * @param obj - Object with potentially null values
 * @returns Object with null values converted to undefined
 */
function nullToUndefined<T extends Record<string, any>>(obj: T): any {
  const result = {} as any;
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === null ? undefined : value;
  }
  return result;
}

/**
 * Server-side function to fetch and format all sources data.
 * Combines lexicon and testimony data with UI-specific formatting.
 * @returns Formatted sources data ready for display
 */
async function getSources(): Promise<{
  lexiconSources: LexiconSource[];
  testimonySources: TestimonySource[];
}> {
  try {
    const lexiconEntries = await fetchQuery(api.sources.getAllLexiconEntries, {});
    const testimonyEntries = await fetchQuery(api.sources.getAllTestimonies, {});

    const lexiconSources: LexiconSource[] = lexiconEntries.map(
      (entry) => ({
        ...nullToUndefined(entry as any),
        id: entry.sourceId,
        slug: entry.sourceId,
        citation: "Yad Vashem's Holocaust Lexicon",
        description: `${sourcesPageConstants.lexiconOverlay.title} entry: ${entry.title}`,
        tags: [],
        featured: Math.random() < 0.2
      })
    );

    const testimonySources: TestimonySource[] = testimonyEntries.map(
      (entry) => {
        let contentPreview = `Survivor testimony: ${entry.survivor_name}`;

        if (entry.content) {
          // Remove timestamp markers for preview
          const content = entry.content.replace(/[\[\d:]+\]/g, "");
          const lines = content.split("\n").filter((line) => line.trim());

          const survivorLines = lines.filter(
            (line) =>
              !line.trim().startsWith("David Boder:") &&
              !line.trim().startsWith("Dr. Boder:") &&
              !line.trim().startsWith("DAVID BODER:") &&
              line.trim().length > 50
          );

          if (survivorLines.length > 0) {
            contentPreview = survivorLines
              .slice(0, 3)
              .join(" ")
              .substring(0, 200);
            if (contentPreview.length >= 200) contentPreview += "...";
          }
        }

        return {
          ...nullToUndefined(entry as any),
          id: entry.sourceId,
          title: entry.survivor_name || undefined, // Use survivor name as title for display
          survivorName: entry.survivor_name || undefined,
          description: entry.description || contentPreview,
          tags: [],
          featured: Math.random() < 0.2
        };
      }
    );

    return { lexiconSources, testimonySources };
  } catch (error) {
    console.error("Error fetching sources data:", error);

    // Return empty arrays to prevent app crash
    return {
      lexiconSources: [],
      testimonySources: []
    };
  }
}

/**
 * Main sources page component.
 * Server component that fetches data and renders with proper loading states.
 * @returns JSX element containing the sources page
 */
export default async function SourcesPage(): Promise<JSX.Element> {
  try {
    const { lexiconSources, testimonySources } = await getSources();

    return (
      <div className="flex-1 min-h-0">
        <Suspense fallback={<SourcesPageFallback />}>
          <SourcesPageContent
            lexiconSources={lexiconSources}
            testimonySources={testimonySources}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Critical error in SourcesPage:", error);

    // Return a fallback error state
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to Load Sources
          </h1>
          <p className="text-gray-600">
            We're experiencing technical difficulties. Please try refreshing the
            page.
          </p>
        </div>
      </div>
    );
  }
}
