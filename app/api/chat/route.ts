import { lexiconTool, testimonyTool, showUsersAudio } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { holocaustEducatorPrompt } from "./prompts";
import { chatApiConstants, chatApiErrors } from "./constants";
import { logger, logApiRequest, logApiResponse } from "@/lib/utils/logger";
import type { ChatRequest, ChatErrorResponse, ChatApiContext } from "./types";

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

    // Validate request data
    const validationError = validateChatRequest(requestData);
    if (validationError) {
      return createErrorResponse(validationError, 400, context);
    }

    logger.debug("Messages validated", { count: messages?.length });

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
 * Validates the incoming chat request structure and content.
 */
function validateChatRequest(request: any): string | null {
  if (!request) {
    return chatApiErrors.invalidRequest;
  }

  if (!request.messages) {
    return chatApiErrors.missingMessages;
  }

  if (!Array.isArray(request.messages)) {
    return chatApiErrors.invalidMessages;
  }

  if (request.messages.length === 0) {
    return chatApiErrors.missingMessages;
  }

  // Validate each message structure
  for (const message of request.messages) {
    if (!message.role || !message.content) {
      return "Invalid message format: missing role or content";
    }
    
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return "Invalid message role: must be user, assistant, or system";
    }
    
    if (typeof message.content !== 'string') {
      return "Invalid message content: must be string";
    }
  }

  return null;
}

/**
 * Creates a standardized error response.
 */
function createErrorResponse(message: string, status: number, context: ChatApiContext): Response {
  const duration = Date.now() - context.startTime;
  const errorResponse: ChatErrorResponse = {
    error: status >= 500 ? chatApiErrors.internalServerError : "Validation error",
    message,
    timestamp: new Date().toISOString()
  };

  logger.error("Chat validation failed", { error: new Error(message), status, ms: duration });

  logApiResponse("POST", chatApiConstants.endpoint, status, duration);

  return new Response(
    JSON.stringify(errorResponse),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
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

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
