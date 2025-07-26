import { describe, test, expect, mock, beforeEach } from "bun:test";

// Set test environment variables
Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true
});
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";

// Mock external dependencies
const mockStreamText = mock();
const mockConvertToModelMessages = mock();
const mockGoogle = mock();
const mockLogger = {
  info: mock(),
  debug: mock(),
  error: mock()
};
const mockLogApiRequest = mock();
const mockLogApiResponse = mock();

// Mock AI SDK
mock.module("ai", () => ({
  streamText: mockStreamText,
  convertToModelMessages: mockConvertToModelMessages
}));

// Mock Google AI SDK
mock.module("@ai-sdk/google", () => ({
  google: mockGoogle
}));

// Mock tools
mock.module("@/lib/tools", () => ({
  lexiconTool: { name: "lexiconTool" },
  testimonyTool: { name: "testimonyTool" },
  showUsersAudio: { name: "showUsersAudio" }
}));

// Mock prompts
mock.module("../prompts", () => ({
  holocaustEducatorPrompt: "Test Holocaust educator prompt"
}));

// Mock constants
mock.module("../constants", () => ({
  chatApiConstants: {
    maxDuration: 60,
    modelName: "gemini-2.5-pro",
    component: "chat",
    endpoint: "/api/chat"
  },
  chatApiErrors: {
    invalidMessages: "Messages array is missing or invalid",
    internalServerError: "Internal server error",
    processingError:
      "An error occurred while processing your request. Please try again.",
    invalidRequest: "Invalid request format",
    missingMessages: "No messages provided in request"
  }
}));

// Mock logger utilities
mock.module("@/lib/logger", () => ({
  logger: mockLogger,
  logApiRequest: mockLogApiRequest,
  logApiResponse: mockLogApiResponse
}));

// Mock types
mock.module("../types", () => ({
  ChatRequest: {},
  ChatErrorResponse: {},
  ChatApiContext: {}
}));

describe("Chat API Route Tests", () => {
  beforeEach(() => {
    // Reset all mocks
    mockStreamText.mockReset();
    mockConvertToModelMessages.mockReset();
    mockGoogle.mockReset();
    mockLogger.info.mockReset();
    mockLogger.debug.mockReset();
    mockLogger.error.mockReset();
    mockLogApiRequest.mockReset();
    mockLogApiResponse.mockReset();

    // Set up default mock behavior
    mockGoogle.mockReturnValue("mock-model");
    mockConvertToModelMessages.mockReturnValue([]);

    const mockStreamResult = {
      toUIMessageStreamResponse: mock().mockReturnValue(
        new Response("mock stream")
      )
    };
    mockStreamText.mockReturnValue(mockStreamResult);
  });

  describe("Successful Chat Processing", () => {
    test("should process valid chat request successfully", async () => {
      const validRequest = {
        messages: [
          {
            role: "user",
            content: "Tell me about the Holocaust",
            id: "msg-1"
          }
        ]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      // Import the route handler
      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response).toBeInstanceOf(Response);
      expect(mockLogApiRequest).toHaveBeenCalledWith("POST", "/api/chat");
      expect(mockLogger.info).toHaveBeenCalledWith("Chat started", { msgs: 1 });
      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "mock-model",
          system: "Test Holocaust educator prompt",
          tools: expect.objectContaining({
            lexiconTool: { name: "lexiconTool" },
            testimonyTool: { name: "testimonyTool" },
            showUsersAudio: { name: "showUsersAudio" }
          })
        })
      );
    });

    test("should handle multiple messages correctly", async () => {
      const validRequest = {
        messages: [
          { role: "user", content: "Hello", id: "msg-1" },
          { role: "assistant", content: "Hi there!", id: "msg-2" },
          {
            role: "user",
            content: "Tell me about concentration camps",
            id: "msg-3"
          }
        ]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response).toBeInstanceOf(Response);
      expect(mockLogger.info).toHaveBeenCalledWith("Chat started", { msgs: 3 });
      expect(mockConvertToModelMessages).toHaveBeenCalledWith(
        validRequest.messages
      );
    });

    test("should log successful completion", async () => {
      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      await POST(request);

      expect(mockLogApiResponse).toHaveBeenCalledWith(
        "POST",
        "/api/chat",
        200,
        expect.any(Number)
      );
      expect(mockLogger.info).toHaveBeenCalledWith("Chat completed", {
        ms: expect.any(Number)
      });
    });
  });

  describe("Request Processing", () => {
    test("should process request with no messages", async () => {
      const request_data = {};

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should process request with empty messages array", async () => {
      const request_data = { messages: [] };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should process request with non-array messages", async () => {
      const request_data = { messages: "not an array" };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should process message with invalid role", async () => {
      const request_data = {
        messages: [
          { role: "invalid_role", content: "Test content", id: "msg-1" }
        ]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should process message with missing content", async () => {
      const request_data = {
        messages: [{ role: "user", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should process message with non-string content", async () => {
      const request_data = {
        messages: [{ role: "user", content: 123, id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    test("should accept valid message roles", async () => {
      const validRoles = ["user", "assistant", "system"];

      for (const role of validRoles) {
        const validRequest = {
          messages: [{ role, content: "Test content", id: "msg-1" }]
        };

        const request = new Request("http://localhost:3000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validRequest)
        });

        const { POST } = await import("../route");
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle streamText errors gracefully", async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error("AI service unavailable");
      });

      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error).toBe("Internal server error");
      expect(responseData.message).toBe(
        "An error occurred while processing your request. Please try again."
      );
      expect(responseData.timestamp).toBeDefined();
    });

    test("should handle JSON parsing errors", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error).toBe("Internal server error");
    });

    test("should handle unknown errors", async () => {
      mockStreamText.mockImplementation(() => {
        throw "Unknown error string";
      });

      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalledWith("Chat error", {
        error: expect.any(Error),
        ms: expect.any(Number)
      });
    });

    test("should log successful requests appropriately", async () => {
      const request_data = { messages: [] };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      await POST(request);

      // Check that success was logged
      expect(mockLogApiResponse).toHaveBeenCalledWith(
        "POST",
        "/api/chat",
        200,
        expect.any(Number)
      );
    });
  });

  describe("Configuration", () => {
    test("should use correct model configuration", async () => {
      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      await POST(request);

      expect(mockGoogle).toHaveBeenCalledWith("gemini-2.5-pro");
      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "mock-model",
          system: "Test Holocaust educator prompt",
          providerOptions: {
            google: {
              thinkingConfig: {
                includeThoughts: true
              }
            }
          }
        })
      );
    });

    test("should include all required tools", async () => {
      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      await POST(request);

      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: {
            lexiconTool: { name: "lexiconTool" },
            testimonyTool: { name: "testimonyTool" },
            showUsersAudio: { name: "showUsersAudio" }
          }
        })
      );
    });

    test("should export correct maxDuration", async () => {
      const { maxDuration } = await import("../route");
      expect(maxDuration).toBe(60);
    });
  });

  describe("Response Format", () => {
    test("should return error responses with correct structure when streamText fails", async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error("AI service unavailable");
      });

      const request_data = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_data)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.headers.get("Content-Type")).toBe("application/json");

      const responseData = await response.json();
      expect(responseData).toHaveProperty("error");
      expect(responseData).toHaveProperty("message");
      expect(responseData).toHaveProperty("timestamp");
      expect(responseData.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
    });

    test("should handle successful responses correctly", async () => {
      const validRequest = {
        messages: [{ role: "user", content: "Test message", id: "msg-1" }]
      };

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest)
      });

      const { POST } = await import("../route");
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response).toBeInstanceOf(Response);
    });
  });
});
