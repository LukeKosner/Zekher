import type { SectionVariants } from "./types";

export const ANIMATION_CONFIG = {
  duration: 0.8,
  ease: "easeOut",
  delays: {
    section1: 0.2,
    section2: 0.4,
    section3: 0.6,
    section4: 0.8,
    section5: 1.0
  },
  transition: {
    opacity: { from: 0, to: 1 },
    y: { from: 30, to: 0 }
  }
} as const;

export const EXTERNAL_LINKS = {
  claude: "https://claude.ai/",
  chatgpt: "https://chatgpt.com",
  claudeConnectors: "https://claude.ai/settings/connectors"
} as const;

export const MCP_SERVER_CONFIG = {
  protocol: "Streamable HTTP",
  endpoints: {
    primary: "/mcp",
    fallback: "/sse"
  }
} as const;

export const CONTACT = {
  email: "support@zekher.com"
} as const;

export const MCP_CAPABILITIES = {
  tools: {
    name: "yad_vashem_holocaust_lexicon",
    description:
      "Search Yad Vashem's Holocaust Lexicon with exact citations and MCP App rendering support.",
    maxResults: 6,
    maxTerms: 6
  },
  appTools: {
    detailName: "yad_vashem_lexicon_entry_detail",
    description:
      "App-only detail loader used by the MCP App to drill into specific source entries."
  },
  appResource: {
    uri: "ui://zekher/lexicon-explorer.html",
    description:
      "Interactive lexicon explorer UI resource rendered inline in MCP Apps-capable hosts."
  },
  prompts: {
    name: "holocaust_education_context",
    description:
      "Provides context and guidelines for using the Yad Vashem Holocaust Lexicon responsibly and effectively in AI applications.",
    type: "Prompt template for proper Holocaust education context"
  }
} as const;

export const PAGE_STYLING = {
  container: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16",
  spacing: "space-y-12",
  sectionSpacing: "space-y-8",
  headingClasses: "text-2xl font-semibold",
  paragraphClasses: "mt-4 text-lg",
  linkClasses: "underline",
  codeBlockClasses: "bg-muted rounded-lg p-4 font-mono text-sm",
  inlineCodeClasses: "bg-muted px-1 py-0.5 rounded text-sm font-mono",
  listClasses: "list-decimal list-inside space-y-2 text-lg",
  borderClasses: "border rounded-lg p-4"
} as const;

export const sectionVariants: SectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration,
      ease: "easeOut"
    }
  }
};
