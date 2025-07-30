// =============================================================================
// CHAT API CONSTANTS
// =============================================================================

// Chat API configuration and constants
export const chatApiConstants = {
  maxDuration: 300,
  modelName: "gemini-2.5-pro-preview-05-06",
  component: "chat",
  endpoint: "/api/chat"
} as const;

// Chat API error messages
export const chatApiErrors = {
  invalidMessages: "Messages array is missing or invalid",
  internalServerError: "Internal server error",
  processingError:
    "An error occurred while processing your request. Please try again.",
  invalidRequest: "Invalid request format",
  missingMessages: "No messages provided in request"
} as const;
