/**
 * Root Layout Component
 *
 * Optimized layout structure with server components by default and client components
 * only where needed for interactivity. Provides global styles, fonts, analytics,
 * authentication, and metadata configuration.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientSidebarLayout } from "@/components/layout/ClientSidebarLayout";
import { Analytics } from "@vercel/analytics/next";

import type { LayoutProps } from "./types";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

/**
 * Inter font configuration for consistent typography
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

/**
 * Application metadata configuration for SEO and social media optimization
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://zekher.com"),
  title: "Zekher",
  description:
    "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies. Built to preserve memory and combat denial.",
  keywords: [
    "Holocaust education",
    "Yad Vashem",
    "survivor testimonies",
    "David Boder",
    "Holocaust history",
    "AI education"
  ],
  openGraph: {
    title: "Zekher",
    description:
      "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies. Built to preserve memory and combat denial.",
    url: "https://zekher.com",
    siteName: "Zekher",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 512,
        height: 512,
        alt: "Zekher - Holocaust Education"
      }
    ]
  },
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      }
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "192x192",
      type: "image/png"
    }
  },
  manifest: "/site.webmanifest"
};

/**
 * Root Layout Component
 *
 * Server component that handles static HTML structure and provides:
 * - Authentication context via ClerkProvider
 * - Analytics tracking
 * - Performance optimizations (DNS prefetch, font loading)
 * - Global styles and theme configuration
 * - Client component boundary for interactive elements
 *
 * @param children - React node children to render in the layout
 * @returns JSX element representing the root HTML structure
 */
export default function RootLayout({ children }: Readonly<LayoutProps>) {
  // Input validation
  if (!children) {
    logger.warn("RootLayout: No children provided");
  }

  // Validate layout constants are properly loaded
  const siteName = "Zekher";
  const description =
    "Access authoritative Holocaust education materials through AI-powered search of Yad Vashem resources and survivor testimonies. Built to preserve memory and combat denial.";

  if (!siteName || !description) {
    logger.error("RootLayout: Layout constants not properly configured", {
      siteName,
      description
    });
    Sentry.captureMessage("Layout constants not properly configured", {
      level: "error",
      tags: { component: "layout" }
    });
  }

  return (
    <html lang="en">
      <Analytics />
      <head>
        {/* Static performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Client Component boundary - only interactive parts */}
        <ClientSidebarLayout>
          {children || (
            <div className="flex items-center justify-center min-h-screen">
              <p>Loading...</p>
            </div>
          )}
        </ClientSidebarLayout>
      </body>
    </html>
  );
}
