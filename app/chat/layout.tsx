import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Zekher",
  description: "Ask questions about the Holocaust and get answers from survivor testimony and historical sources",
  openGraph: {
    title: "Chat - Zekher",
    description: "Ask questions about the Holocaust and get answers from survivor testimony and historical sources"
  }
};

export default function ChatLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}