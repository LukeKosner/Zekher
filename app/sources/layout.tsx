import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources - Zekher",
  description: "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives",
  openGraph: {
    title: "Sources - Zekher", 
    description: "Browse Holocaust historical sources and survivor testimonies from the Yad Vashem archives"
  }
};

export default function SourcesLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}