/**
 * @file This file contains centralized constants for the sources page feature.
 * It includes configuration for UI text, loading states, API parameters, and error messages.
 * Centralizing these constants improves maintainability and consistency.
 */

/**
 * Configuration and constants for the sources page UI and logic.
 */
export const sourcesPageConstants = {
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
    noLexiconEntries: "No lexicon entries available.",
    noTestimonies: "No testimonies available.",
    noSearchResults: {
      lexicon: "No lexicon entries match your search.",
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
      notFoundDescription: "The requested lexicon entry could not be found.",
      defaultTitle: "Holocaust Lexicon",
      defaultDescription: "Yad Vashem Holocaust Lexicon entry",
      archiveFooter: "This lexicon entry is part of the Zekher Holocaust Education Archive."
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

// Sources-specific error messages
export const sourcesErrorMessages = {
  sources: {
    notFound: "Source not found",
    invalidType: "Invalid source type",
    missingParams: "Missing required parameters",
    systemError: "An error occurred while fetching sources."
  }
} as const;