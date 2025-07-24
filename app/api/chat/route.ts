import { lexiconTool, testimonyTool, showUsersAudio } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { holocaustEducatorPrompt } from "./prompts";
import { chatApiConstants, chatApiErrors } from "./constants";
import { logger, logApiRequest, logApiResponse } from "@/lib/utils/logger";
import type { ChatErrorResponse, ChatApiContext } from "./types";

export const maxDuration = 60;

/**
 * Chat API endpoint for Holocaust education conversations.
 * Provides access to lexicon search, testimony search, and audio playback tools.
 * Uses streaming responses for real-time conversation experience.
 */
export async function POST(req: Request): Promise<Response> {
  const context: ChatApiContext = {
    startTime: Date.now()
  };

  try {
    const requestData = await req.json();

    logApiRequest("POST", chatApiConstants.endpoint);
    logger.info("Chat started", { msgs: requestData.messages?.length || 0 });

    const { messages }: { messages: UIMessage[] } = requestData;

    const streamResult = streamText({
      model: google(chatApiConstants.modelName),
      messages: convertToModelMessages(messages),
      system: holocaustEducatorPrompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            includeThoughts: true
          }
        }
      },
      tools: {
        lexiconTool,
        testimonyTool,
        showUsersAudio
      }
    });

    const response = streamResult.toUIMessageStreamResponse();

    const duration = Date.now() - context.startTime;
    logApiResponse("POST", chatApiConstants.endpoint, 200, duration);
    logger.info("Chat completed", { ms: duration });

    return response;
  } catch (error) {
    return handleChatError(error, context);
  }
}

/**
 * Handles errors that occur during chat processing.
 */
function handleChatError(error: unknown, context: ChatApiContext): Response {
  const duration = Date.now() - context.startTime;
  const errorObj = error instanceof Error ? error : new Error(String(error));

  logger.error("Chat error", { error: errorObj, ms: duration });

  logApiResponse("POST", chatApiConstants.endpoint, 500, duration);

  const errorResponse: ChatErrorResponse = {
    error: chatApiErrors.internalServerError,
    message: chatApiErrors.processingError,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
