import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Zekher", 
  description: "Ask questions about the Holocaust and get answers from Yad Vashem's Lexicon and survivor testimonies. AI-powered historical education.",
  keywords: ["Holocaust questions", "Holocaust chat", "AI education", "survivor testimonies", "Holocaust history", "Yad Vashem"],
  openGraph: {
    title: "Chat - Zekher",
    description: "Ask questions about the Holocaust and get answers from Yad Vashem's Lexicon and survivor testimonies.",
    type: "website",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}