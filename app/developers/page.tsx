import type { Metadata } from "next";
import { redirect } from "next/navigation";

// =============================================================================
// DEVELOPERS PAGE METADATA
// =============================================================================

const MCP_METADATA: Metadata = {
  title: "Developers - Zekher",
  description:
    "Developer resources for integrating Zekher's Holocaust education tools into your applications."
} as const;

export const metadata: Metadata = MCP_METADATA;

export default function DevelopersPage() {
  redirect("/developers/mcp");
}
