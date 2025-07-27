/**
 * @fileoverview Sources page component for displaying Holocaust Lexicon and Testimony sources.
 * Handles server-side data fetching, formatting, and rendering with proper loading states.
 */

import type { Metadata } from "next";

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
import { getAllLexiconEntries } from "@/lib/database";
import { getAllTestimonies } from "@/lib/database";
import { LexiconSource, TestimonySource } from "./types";
// =============================================================================
// SOURCES PAGE CONSTANTS
// =============================================================================

const sourcesPageConstants = {
  // Card overlay text
  lexiconOverlay: {
    title: "Holocaust Lexicon",
    actionText: "View Full PDF",
    actionIcon: "FileText"
  },

  testimonyOverlay: {
    title: "Interview with David Boder",
    actionText: "Read Full Testimony",
    actionIcon: "BookOpen"
  },

  // Loading states
  loadingStates: {
    sources: "Loading Sources",
    sourceLibrary: "Loading Source Library",
    loadingMore: "Loading...",
    searching: "Searching historical records...",
    findingTestimonies: "Finding survivor testimonies..."
  },

  // Page content
  pageContent: {
    title: "Source Library",
    description:
      "Zekher hosts the entirety of Yad Vashem's Holocaust Lexicon and a selection of survivor interviews with David P. Boder.",
    searchPlaceholder: "Search sources...",
    noFeaturedSources: "No featured sources available.",
    noLexiconEntries: "No Lexicon entries available.",
    noTestimonies: "No testimonies available.",
    noSearchResults: {
      lexicon: "No Lexicon entries match your search.",
      testimony: "No testimonies match your search."
    }
  },

  // Tab labels
  tabs: {
    featured: "Featured",
    lexicon: "Lexicon",
    testimony: "Testimony"
  },

  // Section titles
  sections: {
    featuredLexicon: "Featured Lexicon Entries",
    featuredTestimonies: "Featured Testimonies"
  },

  // Pagination
  pagination: {
    loadMore: "Load More",
    defaultLimit: 10,
    maxLimit: 50
  },

  // Card UI text
  cardText: {
    lexicon: {
      source: "from Yad Vashem's Holocaust Lexicon",
      externalSource: "from Yad Vashem's website",
      pdfPreviewFallback: "PDF preview not available.",
      openInNewTab: "Open PDF in a new tab",
      textPreview: "Text Preview",
      viewFullText: "View Full Text",
      viewFullPdf: "View Full PDF",
      downloadPdf: "Download PDF",
      visitExternal: "Visit External Resource"
    },
    testimony: {
      source: "from the David P. Boder interviews",
      readFull: "Read Full Testimony"
    }
  },

  // Page metadata
  metadata: {
    lexicon: {
      notFoundTitle: "Lexicon Entry Not Found",
      notFoundDescription: "The requested Lexicon entry could not be found.",
      defaultTitle: "Holocaust Lexicon",
      defaultDescription: "Yad Vashem Holocaust Lexicon entry",
      archiveFooter: "This Lexicon entry is part of the Zekher Holocaust Education Archive."
    },
    testimony: {
      notFoundTitle: "Testimony Not Found",
      notFoundDescription: "The requested testimony could not be found.",
      defaultTitle: "Testimony",
      defaultDescription: "Holocaust survivor testimony",
      archiveFooter: "This testimony is part of the Zekher Holocaust Education Archive."
    }
  }
} as const;

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
    const lexiconEntries = await getAllLexiconEntries();
    const testimonyEntries = await getAllTestimonies();



    const lexiconSources: LexiconSource[] = lexiconEntries.map(
      (entry, index) => ({
        ...nullToUndefined(entry),
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
          ...nullToUndefined(entry),
          title: entry.survivor_name || undefined, // Use survivor name as title for display
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
