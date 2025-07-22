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