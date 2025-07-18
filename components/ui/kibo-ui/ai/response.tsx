"use client";

import type { HTMLAttributes } from "react";
import { memo, createContext, useContext } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { getSourceLink } from "./source";
import * as Sentry from "@sentry/nextjs";

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  citations?: CitationInfo[];
};

export interface CitationInfo {
  id: string;
  title: string;
  url: string;
  type: "lexicon" | "testimony";
}

const CitationContext = createContext<CitationInfo[]>([]);

const components: Options["components"] = {
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn("ml-4 list-outside list-decimal", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("py-1", className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn("ml-4 list-outside list-decimal", className)} {...props}>
      {children}
    </ul>
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn("font-semibold", className)} {...props}>
      {children}
    </span>
  ),
  // Updated citation detection logic for response.tsx
  // Replace the existing 'a' component in your components object

  // Enhanced debugging version for your 'a' component in response.tsx
  a: ({ node, children, className, ...props }) => {
    const href = props.href;

    // Correctly identify source citations by URL pattern (supports both absolute and relative URLs)
    if (
      href &&
      (href.startsWith("/sources?pageType=") ||
        href.includes("/sources?pageType="))
    ) {
      const textContent = Array.isArray(children)
        ? children.join("")
        : String(children);

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center px-1 py-0.5 text-xs font-medium bg-black hover:bg-gray-800 text-white rounded no-underline transition-colors mx-0.5",
            className
          )}
          title={`Source: ${textContent}`}
        >
          {textContent}
        </a>
      );
    }

    // Default link styling for all other links
    return (
      <a
        className={cn("font-medium text-primary underline", className)}
        rel="noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn("mt-6 mb-2 font-semibold text-3xl", className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn("mt-6 mb-2 font-semibold text-2xl", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn("mt-6 mb-2 font-semibold text-xl", className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn("mt-6 mb-2 font-semibold text-base", className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn("mt-6 mb-2 font-semibold text-sm", className)} {...props}>
      {children}
    </h6>
  )
};

function transformCitationsToFootnotes(text: string): string {
  try {
    // Find the Sources section using string operations
    const sourcesStart = text.indexOf("Sources:");
    if (sourcesStart === -1) {
      return text;
    }

    // Find the end of the Sources section (end of text or double newline)
    const sourcesEndPattern = /\n\n|\n$|$/;
    const textAfterSources = text.substring(sourcesStart);
    const endMatch = textAfterSources.search(sourcesEndPattern);
    const sourcesSection =
      endMatch === -1
        ? textAfterSources
        : textAfterSources.substring(0, endMatch);

    const footnotes: Record<string, string> = {};

    // Parse footnotes from Sources section - handle both formats
    const footnotePattern = /^(\d+)\.\s*(.+?)\s*-\s*\[View Source\]\((.*?)\)/gm;
    let match;

    while ((match = footnotePattern.exec(sourcesSection)) !== null) {
      const [, number, title, url] = match;
      footnotes[number] = `[${title}](${url})`;
    }

    // Only process if we found footnotes
    if (Object.keys(footnotes).length === 0) {
      return text;
    }

    // Remove the Sources section from the text
    let transformedText =
      text.substring(0, sourcesStart) +
      text.substring(sourcesStart + sourcesSection.length);

    // Transform numbered footnotes to clickable links
    transformedText = transformedText.replace(/\[(\d+)\]/g, (match, number) => {
      if (footnotes[number]) {
        return footnotes[number];
      }
      return match;
    });

    return transformedText.trim();
  } catch (error) {
    console.error("Error processing footnotes:", error);
    return text;
  }
}

function transformCitationsToLinks(text: string): string {
  console.log("🔄 Transform input:", text.substring(0, 200) + "...");

  try {
    // First try footnote transformation
    const footnoteTransformed = transformCitationsToFootnotes(text);
    if (footnoteTransformed !== text) {
      console.log("✅ Footnote transformation applied");
      return footnoteTransformed;
    }

    // Fallback to legacy citation format
    // Lexicon: [Lexicon ID: ...]
    text = text.replace(/\[Lexicon ID: ([^\]]+)\]/g, (_, id) => {
      const url = getSourceLink({ type: "lexicon", id: id.trim() });
      return `[Lexicon ID: ${id}](${url})`;
    });

    // Testimony: [Testimony ID: ...]
    text = text.replace(/\[Testimony ID: ([^\]]+)\]/g, (_, id) => {
      const url = getSourceLink({ type: "testimony", id: id.trim() });
      return `[Testimony ID: ${id}](${url})`;
    });

    // IMPORTANT: Don't transform simple numbered citations like [1], [2], [3]
    // if they already have proper URLs - let ReactMarkdown handle them as-is

    console.log("📤 Transform output:", text.substring(0, 200) + "...");
    return text;
  } catch (error) {
    console.error("❌ Error in transformCitationsToLinks:", error);
    return text;
  }
}

export const AIResponse = memo(
  ({
    className,
    options,
    children,
    citations = [],
    ...props
  }: AIResponseProps) => (
    <div
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    >
      <CitationContext.Provider value={citations}>
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm]}
          {...options}
        >
          {typeof children === "string"
            ? transformCitationsToLinks(children)
            : children}
        </ReactMarkdown>
      </CitationContext.Provider>
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.citations === nextProps.citations
);
