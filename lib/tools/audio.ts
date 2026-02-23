import { tool } from "ai";
import { z } from "zod";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { toolDescriptions, nextStepsInstructions } from "./prompts";

const audioSegmentInputSchema = z.object({
  testimonyId: z.string().describe("The ID of the testimony"),
  speakerName: z
    .string()
    .describe("Full name of the survivor speaking in this segment"),
  startTime: z.number().describe("Start time in seconds"),
  endTime: z.number().describe("End time in seconds"),
  transcriptExcerpt: z
    .string()
    .describe("Concise exact excerpt (2-3 sentences max) spoken by the survivor"),
  language: z.string().optional().describe("Language spoken if not English"),
  significance: z
    .string()
    .max(500)
    .describe("Brief explanation (1-2 sentences) of why this segment is important"),
});

export const showUsersAudio = tool({
  name: "showUsersAudio",
  description: toolDescriptions.showUsersAudio.description,
  inputSchema: z.object({
    segments: z
      .array(audioSegmentInputSchema)
      .max(toolDescriptions.showUsersAudio.maxSegments)
      .describe(toolDescriptions.showUsersAudio.inputDescription),
  }),
  execute: async ({ segments }) => {
    try {
      return await fetchAction(api.tools.audioToolAction, { segments });
    } catch (error) {
      return {
        type: "audio_segments",
        segments: [],
        message:
          error instanceof Error
            ? error.message
            : nextStepsInstructions.noResults,
      };
    }
  },
});
