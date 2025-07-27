/**
 * Chat API feature types
 */

import type { UIMessage } from "ai";

// Chat API request and response interfaces
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  createdAt?: Date;
}

export interface ChatRequest {
  messages: UIMessage[]; // Using UIMessage from ai package
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