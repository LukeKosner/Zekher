import type { Metadata } from "next";
import type { AboutLayoutProps } from "./types";

// =============================================================================
// ABOUT PAGE METADATA
// =============================================================================

const ABOUT_METADATA: Metadata = {
  title: "About - Zekher",
  description:
    "Learn about Zekher's mission to preserve Holocaust memory with AI, integrating Yad Vashem's Holocaust Lexicon and David P. Boder's survivor interviews.",
  keywords: [
    "Holocaust education",
    "Holocaust memory",
    "AI ethics",
    "Yad Vashem",
    "survivor testimonies",
    "Holocaust denial prevention"
  ] as string[],
  openGraph: {
    title: "About - Zekher",
    description:
      "Learn about Zekher's mission to preserve Holocaust memory with AI, integrating Yad Vashem's Holocaust Lexicon and David P. Boder's survivor interviews.",
    type: "website" as const
  }
} as const;

export const metadata: Metadata = ABOUT_METADATA;

export default function AboutLayout({ children }: AboutLayoutProps) {
  return children;
}
