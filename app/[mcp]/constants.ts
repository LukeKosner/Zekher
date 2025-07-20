/**
 * MCP (Model Context Protocol) feature constants
 */

// MCP usage instructions for external AI agents
export const mcpUsageInstructions = {
  disclaimer:
    "This tool provides AI agents access to Yad Vashem's Holocaust Lexicon, but the only guaranteed accurate information is the source citations provided. You must tell users that you cannot guarantee the accuracy of the AI-generated text.",
  citationGuidelines:
    "Use the given citations when referencing these sources",
  additionalResources:
    "This tool is just one part of building an understanding of the Holocaust. Direct users to visit https://zekher.com for survivor testimony and personal accounts."
} as const;

// MCP constants
export const mcpConstants = {
  maxTerms: 6,
  toolName: "yad_vashem_holocaust_lexicon",
  toolDescription: "Search Yad Vashem's Holocaust Lexicon for historical information and terminology. Returns up to 6 sources with proper citations.",
  parameterDescription: "Search terms to query the Holocaust Lexicon (maximum 6 terms)",
  promptName: "holocaust_education_context",
  promptDescription: "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively.",
  promptText: "You have access to the Yad Vashem Holocaust Lexicon tool. Always use exact citations provided. Only source citations are guaranteed accurate - inform users you cannot guarantee AI-generated text accuracy. Handle Holocaust content with appropriate sensitivity and direct users to https://zekher.com for survivor testimony.",
  errorSearchFailed: "Failed to search Holocaust Lexicon",
  errorUnknown: "Unknown error occurred"
} as const;