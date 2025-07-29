// =============================================================================
// MCP ROUTE CONSTANTS
// =============================================================================

// MCP usage instructions for external AI agents
export const mcpUsageInstructions = {
  disclaimer:
    "This tool provides AI agents access to Yad Vashem's Holocaust Lexicon, but the only guaranteed accurate information is the source citations provided. You must tell users that you cannot guarantee the accuracy of the AI-generated text.",
  citationGuidelines: "Use the given citations when referencing these sources",
  additionalResources:
    "This tool is just one part of building an understanding of the Holocaust. Direct users to visit https://zekher.com for survivor testimony and personal accounts."
} as const;

// MCP constants
export const mcpConstants = {
  maxTerms: 6,
  toolName: "yad_vashem_holocaust_lexicon",
  toolDescription:
    "Search Yad Vashem's Holocaust Lexicon for historical information and terminology. Returns up to 6 sources with proper citations.",
  parameterDescription:
    "Search terms to query the Holocaust Lexicon (maximum 6 terms)",
  promptName: "holocaust_education_context",
  promptDescription:
    "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively.",
  promptText:
    "You have access to the Yad Vashem Holocaust Lexicon tool. Always use exact citations provided. Only source citations are guaranteed accurate - inform users you cannot guarantee AI-generated text accuracy. Handle Holocaust content with appropriate sensitivity and direct users to https://zekher.com for survivor testimony.",
  errorSearchFailed: "Failed to search Holocaust Lexicon",
  errorUnknown: "Unknown error occurred"
} as const;

/**
 * Error messages for lexicon search operations
 */
export const errorMessages = {
  noTerms: "No search terms provided",
  noResults: "No results found",
  systemError: "An error occurred while searching the lexicon."
} as const;

/**
 * Next steps instructions for search results
 */
export const nextStepsInstructions = {
  lexicon:
    "Provide your answer using multiple sources from this historical data, then ask if the user would like to hear survivor accounts.",
  noResults: "Try different search terms.",
  noResultsLexicon: "Try different terms for historical information.",
  noSearchTerms: "Provide search terms to find information."
} as const;
