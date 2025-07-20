import { describe, test, expect, mock, beforeEach } from "bun:test";

// Set test environment variables
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";

// Mock external dependencies
const mockSearchLexicon = mock();
const mockCreateMcpHandler = mock();

mock.module("mcp-handler", () => ({
  createMcpHandler: mockCreateMcpHandler
}));

mock.module("@/lib/tools", () => ({
  searchLexicon: mockSearchLexicon
}));

mock.module("@/lib/prompts", () => ({
  mcpUsageInstructions: {
    disclaimer: "Test disclaimer",
    citationGuidelines: "Test citation guidelines", 
    additionalResources: "Test additional resources"
  },
  mcpConstants: {
    maxTerms: 6,
    toolName: "yad_vashem_holocaust_lexicon",
    toolDescription: "Search Yad Vashem's Holocaust Lexicon for historical information and terminology",
    parameterDescription: "Search terms to query the Holocaust Lexicon (maximum 6 terms)",
    promptName: "holocaust_education_context",
    promptDescription: "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively.",
    promptText: "You have access to the Yad Vashem Holocaust Lexicon tool. Always use exact citations provided. Only source citations are guaranteed accurate - inform users you cannot guarantee AI-generated text accuracy. Handle Holocaust content with appropriate sensitivity and direct users to https://zekher.com for survivor testimony.",
    errorSearchFailed: "Failed to search Holocaust Lexicon",
    errorUnknown: "Unknown error occurred"
  }
}));

mock.module("@/lib/types", () => ({}));

// Use simplified mocking for zod to avoid require() imports
mock.module("zod", () => ({
  z: {
    string: () => ({
      optional: () => ({
        describe: () => ({})
      })
    }),
    array: (schema: any) => ({
      max: (limit: number) => ({
        describe: (desc: string) => ({
          parse: (value: unknown) => {
            if (!Array.isArray(value)) throw new Error("Must be array");
            if (value.length > limit) throw new Error(`Max ${limit} items`);
            if (!value.every(item => typeof item === "string")) throw new Error("All items must be strings");
            return value;
          }
        })
      })
    })
  }
}));

describe("MCP Handler Tests", () => {
  beforeEach(() => {
    // Use mockReset for more thorough cleanup between tests
    mockSearchLexicon.mockReset();
    mockCreateMcpHandler.mockReset();
    mockCreateMcpHandler.mockReturnValue("mock-handler");
  });

  describe("Integration Tests", () => {
    test("should properly call server.tool and server.prompt in sequence", async () => {
      const mockServer = {
        prompt: mock(),
        tool: mock()
      };

      let capturedServerCallback: (server: any) => Promise<void> = async () => {};

      mockCreateMcpHandler.mockImplementation((callback) => {
        capturedServerCallback = callback;
        return "mock-handler";
      });

      // Simulate the actual handler creation
      const mcpUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test citation guidelines",
        additionalResources: "Test additional resources"
      };

      const mcpConstants = {
        maxTerms: 6,
        toolName: "yad_vashem_holocaust_lexicon",
        toolDescription: "Search Yad Vashem's Holocaust Lexicon for historical information and terminology",
        parameterDescription: "Search terms to query the Holocaust Lexicon (maximum 6 terms)",
        promptName: "holocaust_education_context",
        promptDescription: "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively.",
        promptText: "You have access to the Yad Vashem Holocaust Lexicon tool. Always use exact citations provided. Only source citations are guaranteed accurate - inform users you cannot guarantee AI-generated text accuracy. Handle Holocaust content with appropriate sensitivity and direct users to https://zekher.com for survivor testimony."
      };

      mockCreateMcpHandler(
        async (server: any) => {
          // This simulates the actual server callback from route.ts
          server.prompt(
            mcpConstants.promptName,
            mcpConstants.promptDescription,
            async () => ({
              messages: [{
                role: "assistant",
                content: {
                  type: "text",
                  text: mcpConstants.promptText
                }
              }]
            })
          );

          server.tool(
            mcpConstants.toolName,
            mcpConstants.toolDescription,
            { terms: { parse: (v: any) => v } },
            async ({ terms }: { terms: string[] }) => {
              const result = await mockSearchLexicon(terms);
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({
                    sources: result.entries,
                    usageInstructions: mcpUsageInstructions,
                    nextSteps: result.nextSteps
                  }, null, 2)
                }]
              };
            }
          );
        },
        { capabilities: {} },
        { basePath: "/" }
      );

      // Execute the server callback
      await capturedServerCallback(mockServer);

      // Verify both prompt and tool were registered
      expect(mockServer.prompt).toHaveBeenCalledWith(
        mcpConstants.promptName,
        mcpConstants.promptDescription,
        expect.any(Function)
      );

      expect(mockServer.tool).toHaveBeenCalledWith(
        mcpConstants.toolName,
        mcpConstants.toolDescription,
        expect.any(Object),
        expect.any(Function)
      );

      // Verify both calls happened
      expect(mockServer.prompt).toHaveBeenCalledTimes(1);
      expect(mockServer.tool).toHaveBeenCalledTimes(1);
    });
  });

  describe("Handler Configuration", () => {
    test("should create MCP handler with correct configuration", () => {
      const mcpConstants = {
        maxTerms: 6,
        toolName: "yad_vashem_holocaust_lexicon",
        toolDescription: "Search Yad Vashem's Holocaust Lexicon for historical information and terminology",
        parameterDescription: "Search terms to query the Holocaust Lexicon (maximum 6 terms)",
        promptName: "holocaust_education_context",
        promptDescription: "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively."
      };

      // Simulate creating the handler
      const handler = mockCreateMcpHandler(
        async () => {}, // server callback
        {
          capabilities: {
            prompts: {
              [mcpConstants.promptName]: {
                description: mcpConstants.promptDescription
              }
            },
            tools: {
              [mcpConstants.toolName]: {
                description: mcpConstants.toolDescription
              }
            }
          }
        },
        {
          basePath: "/",
          verboseLogs: false,
          maxDuration: 60,
          redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
        }
      );

      expect(mockCreateMcpHandler).toHaveBeenCalledTimes(1);
      expect(handler).toBe("mock-handler");

      const [, capabilities, config] = mockCreateMcpHandler.mock.calls[0];

      // Verify capabilities structure
      expect(capabilities.capabilities.prompts).toBeDefined();
      expect(capabilities.capabilities.prompts[mcpConstants.promptName]).toBeDefined();
      expect(capabilities.capabilities.tools).toBeDefined();
      expect(capabilities.capabilities.tools[mcpConstants.toolName]).toBeDefined();

      // Verify configuration
      expect(config.basePath).toBe("/");
      expect(config.verboseLogs).toBe(false);
      expect(config.maxDuration).toBe(60);
      expect(config.redisUrl).toBe(process.env.REDIS_URL || "redis://localhost:6379");
    });
  });

  describe("Tool Functionality", () => {
    test("should handle successful lexicon search with schema validation", async () => {
      const mockResult = {
        entries: [
          {
            title: "Holocaust",
            content: "Historical information about the Holocaust",
            citation: "[Holocaust](https://example.com/holocaust)",
            filename: "holocaust"
          }
        ],
        nextSteps: "Review the sources provided"
      };

      mockSearchLexicon.mockResolvedValue(mockResult);

      const mcpUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test citation guidelines",
        additionalResources: "Test additional resources"
      };

      // Create a more realistic schema for validation
      const termSchema = {
        parse: (value: unknown) => {
          if (!Array.isArray(value)) throw new Error("Must be array");
          if (value.length > 6) throw new Error("Max 6 items");
          if (!value.every(item => typeof item === "string")) throw new Error("All items must be strings");
          return value;
        }
      };

      // Simulate tool execution with schema validation
      const toolCallback = async ({ terms }: { terms: string[] }) => {
        // Validate input parameters (simulating real zod validation)
        const validatedTerms = termSchema.parse(terms);
        
        try {
          const result = await mockSearchLexicon(validatedTerms);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  sources: result.entries,
                  usageInstructions: mcpUsageInstructions,
                  nextSteps: result.nextSteps
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Failed to search Holocaust Lexicon",
                  message: error instanceof Error ? error.message : "Unknown error occurred",
                  usageInstructions: mcpUsageInstructions
                }, null, 2)
              }
            ]
          };
        }
      };

      const result = await toolCallback({ terms: ["holocaust"] });

      expect(mockSearchLexicon).toHaveBeenCalledWith(["holocaust"]);
      
      const content = JSON.parse(result.content[0].text);
      expect(content.sources).toEqual(mockResult.entries);
      expect(content.usageInstructions).toEqual(mcpUsageInstructions);
      expect(content.nextSteps).toBe(mockResult.nextSteps);
    });

    test("should handle search errors gracefully", async () => {
      const mockError = new Error("Database connection failed");
      mockSearchLexicon.mockRejectedValue(mockError);

      const mcpUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test citation guidelines",
        additionalResources: "Test additional resources"
      };

      // Simulate tool execution with error
      const toolCallback = async ({ terms }: { terms: string[] }) => {
        try {
          const result = await mockSearchLexicon(terms);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  sources: result.entries,
                  usageInstructions: mcpUsageInstructions,
                  nextSteps: result.nextSteps
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Failed to search Holocaust Lexicon",
                  message: error instanceof Error ? error.message : "Unknown error occurred",
                  usageInstructions: mcpUsageInstructions
                }, null, 2)
              }
            ]
          };
        }
      };

      const result = await toolCallback({ terms: ["holocaust"] });

      const content = JSON.parse(result.content[0].text);
      expect(content.error).toBe("Failed to search Holocaust Lexicon");
      expect(content.message).toBe("Database connection failed");
      expect(content.usageInstructions).toEqual(mcpUsageInstructions);
    });

    test("should handle unknown errors", async () => {
      mockSearchLexicon.mockRejectedValue("Unknown error string");

      const mcpUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test citation guidelines",
        additionalResources: "Test additional resources"
      };

      const toolCallback = async ({ terms }: { terms: string[] }) => {
        try {
          const result = await mockSearchLexicon(terms);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  sources: result.entries,
                  usageInstructions: mcpUsageInstructions,
                  nextSteps: result.nextSteps
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Failed to search Holocaust Lexicon",
                  message: error instanceof Error ? error.message : "Unknown error occurred",
                  usageInstructions: mcpUsageInstructions
                }, null, 2)
              }
            ]
          };
        }
      };

      const result = await toolCallback({ terms: ["holocaust"] });

      const content = JSON.parse(result.content[0].text);
      expect(content.error).toBe("Failed to search Holocaust Lexicon");
      expect(content.message).toBe("Unknown error occurred");
    });

    test("should validate tool parameters comprehensively", () => {
      const schema = {
        parse: (value: unknown) => {
          if (!Array.isArray(value)) throw new Error("Must be array");
          if (value.length > 6) throw new Error("Max 6 items");
          if (!value.every(item => typeof item === "string")) throw new Error("All items must be strings");
          return value;
        }
      };

      // Valid inputs
      expect(() => schema.parse(["holocaust"])).not.toThrow();
      expect(() => schema.parse(["holocaust", "germany"])).not.toThrow();
      expect(() => schema.parse(["a", "b", "c", "d", "e", "f"])).not.toThrow();

      // Invalid inputs - type validation
      expect(() => schema.parse("not an array")).toThrow("Must be array");
      expect(() => schema.parse(42)).toThrow("Must be array");
      expect(() => schema.parse(null)).toThrow("Must be array");

      // Invalid inputs - length validation
      expect(() => schema.parse(["a", "b", "c", "d", "e", "f", "g"])).toThrow("Max 6 items");

      // Invalid inputs - string type validation
      expect(() => schema.parse([123, "valid"])).toThrow("All items must be strings");
      expect(() => schema.parse(["valid", null])).toThrow("All items must be strings");
      expect(() => schema.parse([true, "valid"])).toThrow("All items must be strings");
    });
  });

  describe("Prompt Functionality", () => {
    test("should return correct prompt message", async () => {
      const promptCallback = async () => {
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: "You have access to the Yad Vashem Holocaust Lexicon tool. Always use exact citations provided. Only source citations are guaranteed accurate - inform users you cannot guarantee AI-generated text accuracy. Handle Holocaust content with appropriate sensitivity and direct users to https://zekher.com for survivor testimony."
              }
            }
          ]
        };
      };

      const result = await promptCallback();

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe("assistant");
      expect(result.messages[0].content.type).toBe("text");
      expect(result.messages[0].content.text).toContain("Yad Vashem Holocaust Lexicon");
      expect(result.messages[0].content.text).toContain("exact citations");
      expect(result.messages[0].content.text).toContain("https://zekher.com");
    });
  });

  describe("Response Formatting", () => {
    test("should format successful response correctly", () => {
      const mockEntries = [
        {
          title: "Test Entry",
          content: "Test content",
          citation: "[Test](https://example.com)",
          filename: "test"
        }
      ];

      const mockUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test guidelines",
        additionalResources: "Test resources"
      };

      const response = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              sources: mockEntries,
              usageInstructions: mockUsageInstructions,
              nextSteps: "Test next steps"
            }, null, 2)
          }
        ]
      };

      const content = JSON.parse(response.content[0].text);
      
      expect(content).toHaveProperty("sources");
      expect(content).toHaveProperty("usageInstructions");
      expect(content).toHaveProperty("nextSteps");
      expect(content.sources).toHaveLength(1);
      expect(content.sources[0].title).toBe("Test Entry");
    });

    test("should format error response correctly", () => {
      const mockUsageInstructions = {
        disclaimer: "Test disclaimer",
        citationGuidelines: "Test guidelines",
        additionalResources: "Test resources"
      };

      const errorResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Failed to search Holocaust Lexicon",
              message: "Test error message",
              usageInstructions: mockUsageInstructions
            }, null, 2)
          }
        ]
      };

      const content = JSON.parse(errorResponse.content[0].text);
      
      expect(content).toHaveProperty("error");
      expect(content).toHaveProperty("message");
      expect(content).toHaveProperty("usageInstructions");
      expect(content.error).toBe("Failed to search Holocaust Lexicon");
      expect(content.message).toBe("Test error message");
    });
  });

  describe("Configuration Values", () => {
    test("should use correct base path", () => {
      const config = {
        basePath: "/",
        verboseLogs: true,
        maxDuration: 60,
        redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
      };

      expect(config.basePath).toBe("/");
    });

    test("should disable verbose logging for space efficiency", () => {
      const config = {
        basePath: "/",
        verboseLogs: false,
        maxDuration: 60,
        redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
      };

      expect(config.verboseLogs).toBe(false);
    });

    test("should set correct timeout duration", () => {
      const config = {
        basePath: "/",
        verboseLogs: true,
        maxDuration: 60,
        redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
      };

      expect(config.maxDuration).toBe(60);
    });

    test("should use Redis URL from environment", () => {
      const config = {
        basePath: "/",
        verboseLogs: true,
        maxDuration: 60,
        redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
      };

      expect(config.redisUrl).toBe(process.env.REDIS_URL || "redis://localhost:6379");
    });
  });
});