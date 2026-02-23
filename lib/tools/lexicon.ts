import { tool } from "ai";
import { z } from "zod";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { nextStepsInstructions, errorMessages, toolDescriptions } from "./prompts";

export const searchLexicon = async (searchTerms: string[]) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.lexicon.noTerms,
        entries: [],
        formattedText: errorMessages.lexicon.noTerms,
        nextSteps: nextStepsInstructions.noSearchTerms,
      };
    }

    return await fetchAction(api.tools.lexiconToolAction, { terms: searchTerms });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : errorMessages.lexicon.systemError,
      entries: [],
      formattedText: errorMessages.lexicon.systemError,
      nextSteps: nextStepsInstructions.noResults,
    };
  }
};

export const lexiconTool = tool({
  name: "lexiconTool",
  description: toolDescriptions.lexiconTool.description,
  inputSchema: z.object({
    terms: z
      .array(z.string())
      .max(toolDescriptions.lexiconTool.maxTerms)
      .describe(toolDescriptions.lexiconTool.inputDescription),
  }),
  execute: async ({ terms }) => {
    return await searchLexicon(terms);
  },
});
