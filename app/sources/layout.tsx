/**
 * @file Defines the layout for the sources section of the application.
 * This component sets metadata for the sources pages and wraps child routes in a consistent layout.
 */

import type { Metadata } from "next";

/**
 * Metadata for the sources pages.
 */

export const metadata: Metadata = {
  title: "Sources - Zekher",
  description: "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives",
  openGraph: {
    title: "Sources - Zekher", 
    description: "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives"
  }
};

export default function SourcesLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative flex h-full w-full flex-col divide-y min-h-0">{children}</div>;
}