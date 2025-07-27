import type { Metadata } from "next";
import type { DevelopersLayoutProps } from "./types";

// =============================================================================
// DEVELOPERS LAYOUT METADATA
// =============================================================================

const DEVELOPERS_METADATA: Metadata = {
  title: "Developers - Zekher",
  description:
    "Developer resources for integrating Zekher's Holocaust education tools into your applications.",
  keywords: [
    "MCP server",
    "Model Context Protocol",
    "Holocaust API",
    "Claude integration",
    "ChatGPT integration",
    "AI development",
    "Holocaust education API"
  ] as string[],
  openGraph: {
    title: "Developers - Zekher",
    description:
      "Developer resources for integrating Zekher's Holocaust education tools into your applications.",
    type: "website" as const
  }
} as const;

export const metadata: Metadata = DEVELOPERS_METADATA;

export default function DevelopersLayout({ children }: DevelopersLayoutProps) {
  return children;
}
