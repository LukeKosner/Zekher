import { tool } from "ai";
import { z } from "zod";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { nextStepsInstructions, errorMessages, toolDescriptions } from "./prompts";

export const searchTestimonies = async (searchTerms: string[]) => {
  try {
    if (!searchTerms?.length) {
      return {
        error: errorMessages.testimony.noTerms,
        entries: [],
        formattedText: errorMessages.testimony.noTerms,
        nextSteps: nextStepsInstructions.noSearchTermsTestimony,
      };
    }
    return await fetchAction(api.tools.testimonyToolAction, { terms: searchTerms });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : errorMessages.testimony.systemError;
    return {
      error: message,
      entries: [],
      formattedText: message,
      nextSteps: nextStepsInstructions.noResults,
    };
  }
};

export const testimonyTool = tool({
  name: "testimonyTool",
  description: toolDescriptions.testimonyTool.description,
  inputSchema: z.object({
    terms: z
      .array(z.string())
      .max(toolDescriptions.testimonyTool.maxTerms)
      .describe(toolDescriptions.testimonyTool.inputDescription),
  }),
  execute: async ({ terms }) => {
    return await searchTestimonies(terms);
  },
});
