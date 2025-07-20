import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { searchLexicon } from "../../lib/tools/lexicon";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "yad_vashem_holocaust_lexicon",
      "Search Yad Vashem's Holocaust Lexicon for historical information and terminology. Returns up to 6 sources with proper citations.",
      {
        terms: z
          .array(z.string())
          .max(6)
          .describe("Search terms to query the Holocaust Lexicon (maximum 6 terms)")
      },
      async ({ terms }) => {
        const result = await searchLexicon(terms);
        
        const usageInstructions = {
          citationGuidelines: "Use standard academic citations when referencing these sources",
          additionalResources: "For Holocaust survivor testimony and personal accounts, visit Zekher.com",
          sourceLimit: "This tool provides up to 6 sources per query for comprehensive coverage"
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                sources: result.entries,
                formattedText: result.formattedText,
                usageInstructions,
                nextSteps: result.nextSteps
              }, null, 2)
            }
          ]
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        yad_vashem_holocaust_lexicon: {
          description: "Search Yad Vashem's Holocaust Lexicon for historical information and terminology"
        }
      }
    }
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    redisUrl: process.env.REDIS_URL
  }
);

export { handler as GET, handler as POST, handler as DELETE };
