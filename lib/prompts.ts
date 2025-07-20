/**
 * Shared prompts and tool descriptions used across features
 */

// Tool descriptions and configurations (used by shared tools)
export const toolDescriptions = {
  lexiconTool: {
    description:
      "Get authoritative historical information from Yad Vashem's Holocaust Lexicon. Use for factual/historical questions (what, when, where, who, how many, definitions). Maximum 6 search terms. Returns up to 6 lexicon entries with next steps instructions.",
    inputDescription:
      "Array of Holocaust-related terms to search. Use specific, relevant terms from the user's question. Maximum 6 terms.",
    maxTerms: 6
  },

  testimonyTool: {
    description:
      "Search Holocaust survivor testimonies for personal accounts and lived experiences. Use for questions about personal experiences, survivor stories, or individual accounts. Returns up to 1 testimony with next steps instructions.",
    inputDescription:
      "Array of terms to search in survivor testimonies. Use specific terms related to experiences, locations, events, or concepts. Maximum 3 terms.",
    maxTerms: 3
  },

  showUsersAudio: {
    description: `Present the most impactful audio segment(s) from survivor testimonies. STRICT GUIDELINES:
- Select only 2-3 of the MOST powerful and relevant segments
- Focus on segments that directly answer the user's question
- Prioritize emotional impact and historical significance
- Keep transcriptExcerpt concise (2-3 sentences max) and EXACTLY as spoken
- Only include essential significance description

Return confirmation that audio has been queued for playback.`,
    inputDescription:
      "Maximum 3 carefully selected audio segments that powerfully answer the user's question",
    maxSegments: 3
  }
} as const;

// Next steps instructions for each tool
export const nextStepsInstructions = {
  lexicon:
    "Provide your answer using multiple sources from this historical data, then ask if the user would like to hear survivor accounts.",

  testimony:
    "Now use showUsersAudio to present relevant audio segments from these testimonies.",

  audio: "Audio segments ready for playback.",

  noResults: "Try different search terms.",

  noResultsTestimony: "Try different terms to find survivor accounts.",

  noResultsLexicon: "Try different terms for historical information.",

  noSearchTerms: "Provide search terms to find information.",

  noSearchTermsTestimony: "Provide search terms to find survivor accounts."
} as const;

// Error messages for tools
export const errorMessages = {
  lexicon: {
    noTerms: "No search terms provided",
    noResults: "No results found",
    systemError: "An error occurred while searching the lexicon."
  },

  testimony: {
    noTerms: "No search terms provided",
    noResults: "No results found",
    systemError: "An error occurred while searching testimonies."
  },

  audio: {
    noSegments: "No audio segments provided",
    processingError: "Error processing audio segments"
  }
} as const;