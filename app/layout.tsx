// Optimized Layout: Server Component by default, Client Components only where needed

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientSidebarLayout } from "@/components/layout/ClientSidebarLayout";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    template: "%s | Zekher",
    default: "Zekher"
  },
  description: "AI-powered Holocaust education with survivor testimony search",
  openGraph: {
    title: "Zekher - Holocaust Education",
    description:
      "AI-powered Holocaust education with survivor testimony search",
    url: "https://zekher.com",
    siteName: "Zekher",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
  },
  manifest: "/site.webmanifest"
};

// Server Component - handles static HTML structure
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Analytics />
          <head>
            {/* Static performance optimizations */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />
            <meta name="theme-color" content="#1f2937" />
          </head>
          <body className={`${inter.variable} antialiased`}>
            {/* Client Component boundary - only interactive parts */}
            <ClientSidebarLayout>{children}</ClientSidebarLayout>
          </body>
      </html>
    </ClerkProvider>
  );
}
