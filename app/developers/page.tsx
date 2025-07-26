import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MCP_METADATA } from './constants';

export const metadata: Metadata = MCP_METADATA;

export default function DevelopersPage() {
  redirect("/developers/mcp");
}
