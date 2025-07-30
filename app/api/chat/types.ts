/**
 * Chat API feature types
 */

import type { UIMessage } from "ai";

// Define custom message type with content-filter data part schema
export type CustomUIMessage = UIMessage<
  never, // metadata type
  {
    contentFilter: {
      finishReason: string;
      providerMetadata: any;
      timestamp: string;
      message: string;
    };
  } // data parts type
>;

// Chat API request and response interfaces
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  createdAt?: Date;
}

export interface ChatRequest {
  messages: CustomUIMessage[]; // Using CustomUIMessage with content-filter support
}

export interface ChatErrorResponse {
  error: string;
  message: string;
  timestamp?: string;
}

export interface ChatValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ChatApiContext {
  startTime: number;
  requestId?: string;
  userId?: string;
}