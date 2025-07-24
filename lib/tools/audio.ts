import { tool } from "ai";
import { z } from "zod";
import {
  generateAudioUrl,
  type AudioUrlParams
} from "@/lib/utils/url-generation";
import {
  trackAudioLoading,
  trackSpeakerMappingError,
  createMonitoringContext,
  ErrorType,
  type AudioLoadingMetrics
} from "@/lib/utils/monitoring";
import { getTestimonyMetadata } from "@/lib/ingestion/processors/testimony-languages";
import { getTestimonyById } from "@/lib/utils/testimony";
import { getAudioUrl } from "@/lib/utils/blob-urls";
import { logger } from "@/lib/utils/logger";
import { toolDescriptions, nextStepsInstructions } from "@/lib/prompts";

/**
 * Extract timestamp from transcript excerpt
 * Looks for patterns like [00:01:23] or [01:23] and converts to seconds
 */
function extractTimestampFromTranscript(transcript: string): number | null {
  // Look for timestamp patterns like [00:01:23] or [01:23]
  const timestampRegex = /\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]/;
  const match = transcript.match(timestampRegex);

  if (match) {
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

/**
 * Generate audio file URL from speaker name using centralized URL generation
 * Always overrides any AI-provided audioFile values
 */
function generateAudioFileFromSpeaker(speakerName: string): {
  url: string;
  urlSource: "blob" | "gcs" | "fallback";
} {
  if (!speakerName || typeof speakerName !== "string") {
    trackSpeakerMappingError(
      speakerName || "undefined",
      "Speaker name is required and must be a string"
    );
    throw new Error("Speaker name is required and must be a string");
  }

  const trimmedName = speakerName.trim();
  if (!trimmedName) {
    trackSpeakerMappingError(speakerName, "Speaker name cannot be empty");
    throw new Error("Speaker name cannot be empty");
  }

  try {
    // Use centralized URL generation with proper fallback chain
    const audioUrlParams: AudioUrlParams = {
      speakerName: trimmedName
    };

    const url = generateAudioUrl(audioUrlParams);

    // Determine URL source based on the URL pattern
    let urlSource: "blob" | "gcs" | "fallback";
    if (url.startsWith("blob:")) {
      urlSource = "blob";
    } else if (url.includes("storage.googleapis.com")) {
      urlSource = "gcs";
    } else {
      urlSource = "fallback";
    }

    return { url, urlSource };
  } catch (error) {
    const errorMessage = `Failed to generate audio URL for speaker "${speakerName}": ${
      error instanceof Error ? error.message : "Unknown error"
    }`;

    trackSpeakerMappingError(speakerName, errorMessage, false);
    throw new Error(errorMessage);
  }
}

// Input schema - AI provides these fields only (audioFile removed)
const audioSegmentInputSchema = z.object({
  testimonyId: z.string().describe("The ID of the testimony"),
  speakerName: z
    .string()
    .describe("Full name of the survivor speaking in this segment"),
  startTime: z.number().describe("Start time in seconds"),
  endTime: z.number().describe("End time in seconds"),
  transcriptExcerpt: z
    .string()
    .describe(
      "Concise EXACT excerpt (2-3 sentences max) spoken by the survivor"
    ),
  language: z.string().optional().describe("Language spoken if not English"),
  significance: z
    .string()
    .max(300)
    .describe(
      "Brief explanation (1-2 sentences) of why this segment is important"
    )
});

export const showUsersAudio = tool({
  description: toolDescriptions.showUsersAudio.description,
  inputSchema: z.object({
    segments: z
      .array(audioSegmentInputSchema)
      .max(toolDescriptions.showUsersAudio.maxSegments)
      .describe(toolDescriptions.showUsersAudio.inputDescription)
  }),
  execute: async ({ segments }) => {
    const processedAt = new Date().toISOString();
    const errors: string[] = [];
    const monitoringContext = createMonitoringContext("audio_tool_execution");

    console.log("Audio tool executing with segments:", segments.length);

    const processedSegments = await Promise.all(segments.map(async (segment, index) => {
      const startTime = Date.now();
      let fallbackUsed = false;
      let urlSource: "blob" | "gcs" | "fallback" = "gcs";

      // Look up testimony URL from database using testimonyId (outside try-catch so it's available in error handling)
      let testimonyUrl: string | undefined;
      try {
        if (segment.testimonyId) {
          const testimony = await getTestimonyById(segment.testimonyId);
          testimonyUrl = testimony?.url || undefined;
        }
      } catch (error) {
        logger.warn("Failed to look up testimony URL", {
          testimonyId: segment.testimonyId,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }

      try {
        // Get testimony metadata for the speaker
        const metadata = getTestimonyMetadata(segment.speakerName);

        // Generate audioFile using centralized URL generation
        const audioFile = generateAudioUrl({
          speakerName: segment.speakerName
        });

        const processedSegment = {
          ...segment,
          audioFile, // Always generated internally, never from AI input
          language: segment.language || metadata.language,
          languageCode: (segment as any).languageCode || metadata.languageCode,
          url: testimonyUrl
        };

        const loadTimeMs = Date.now() - startTime;

        // Track successful audio URL generation
        const metrics: AudioLoadingMetrics = {
          speakerName: segment.speakerName,
          audioFilename: audioFile,
          success: true,
          loadTimeMs,
          fallbackUsed: false,
          urlSource
        };

        trackAudioLoading(metrics);
        monitoringContext.trackSuccess();

        logger.info("Audio segment processed", {
          segmentIndex: index + 1,
          speakerName: segment.speakerName,
          generatedAudioFile: audioFile,
          testimonyId: segment.testimonyId,
          urlSource,
          loadTimeMs,
          component: "audio-tool"
        });

        return processedSegment;
      } catch (error) {
        const loadTimeMs = Date.now() - startTime;
        const errorMessage = `Failed to process audio segment for ${segment.speakerName}: ${error instanceof Error ? error.message : "Unknown error"}`;
        errors.push(errorMessage);

        // Log detailed error information for debugging
        console.error("Failed to process audio segment", {
          segment,
          errorMessage
        });

        // Track the initial failure
        const failureMetrics: AudioLoadingMetrics = {
          speakerName: segment.speakerName,
          audioFilename: "unknown",
          success: false,
          loadTimeMs,
          errorType: ErrorType.AUDIO_LOADING,
          errorMessage,
          fallbackUsed: false,
          urlSource: "gcs"
        };

        trackAudioLoading(failureMetrics);
        monitoringContext.trackError(ErrorType.AUDIO_LOADING, errorMessage);

        // Return segment with fallback audioFile using centralized URL generation
        try {
          const fallbackUrl = generateAudioUrl({
            speakerName: "fallback",
            fallbackFilename: "fallback.mp3"
          });

          fallbackUsed = true;
          urlSource = "fallback";

          // Track successful fallback
          const fallbackMetrics: AudioLoadingMetrics = {
            speakerName: segment.speakerName,
            audioFilename: fallbackUrl,
            success: true,
            loadTimeMs: Date.now() - startTime,
            fallbackUsed: true,
            urlSource: "fallback"
          };

          trackAudioLoading(fallbackMetrics);

          return {
            ...segment,
            audioFile: fallbackUrl,
            url: testimonyUrl
          };
        } catch (fallbackError) {
          // If even fallback fails, use direct GCS URL
          const finalFallbackUrl =
            "https://storage.googleapis.com/zekher-storage/audio/fallback.mp3";

          // Track final fallback attempt
          const finalFallbackMetrics: AudioLoadingMetrics = {
            speakerName: segment.speakerName,
            audioFilename: finalFallbackUrl,
            success: false,
            loadTimeMs: Date.now() - startTime,
            errorType: ErrorType.CONFIGURATION,
            errorMessage: `All fallbacks failed: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`,
            fallbackUsed: true,
            urlSource: "fallback"
          };

          trackAudioLoading(finalFallbackMetrics);

          return {
            ...segment,
            audioFile: finalFallbackUrl,
            url: testimonyUrl
          };
        }
      }
    }));

    // Finish monitoring context and get summary metrics
    const summaryMetrics = monitoringContext.finish();

    const result = {
      type: "audio_segments",
      segments: processedSegments,
      message: `${nextStepsInstructions.audio.replace("for the selected segments", `for ${processedSegments.length} segment(s)`)}`
    };

    if (errors.length > 0) {
      console.warn(
        `Audio tool completed with ${errors.length} errors:`,
        errors
      );
    } else {
      console.log(
        `Audio tool completed successfully. Generated ${processedSegments.length} audio URLs with ${summaryMetrics.successRate.toFixed(2)}% success rate.`
      );
    }

    return result;
  }
});
