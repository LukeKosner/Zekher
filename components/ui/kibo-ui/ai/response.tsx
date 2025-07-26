"use client";

import type { HTMLAttributes } from "react";
import { memo, createContext } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "motion/react";
import { cn } from "@/lib";
import { getSourceLink } from "./source";
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

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

const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } }
};

// Helper to create motion components with proper prop filtering
const createMotionComponent =
  (Tag: keyof typeof motion, defaultClassName = "") =>
  ({ node, children, className, ...props }: any) => {
    // Filter out conflicting props that have different signatures in Motion vs React
    const {
      onDrag,
      onDragStart,
      onDragEnd,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionEnd,
      ...htmlProps
    } = props;
    const MotionTag = motion[Tag] as any;
    return (
      <MotionTag
        key={node?.position?.start.offset}
        className={cn(defaultClassName, className)}
        {...fadeUp}
        {...htmlProps}
      >
        {children}
      </MotionTag>
    );
  };

const components: Options["components"] = {
  ol: createMotionComponent("ol", "ml-4 list-outside list-decimal"),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("py-1", className)} {...props}>
      {children}
    </li>
  ),
  ul: createMotionComponent("ul", "ml-4 list-outside list-decimal"),
  p: createMotionComponent("p"),
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
      (href.startsWith("/sources/lexicon/") ||
        href.startsWith("/sources/testimony/") ||
        href.includes("/sources/lexicon/") ||
        href.includes("/sources/testimony/"))
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
  h1: createMotionComponent("h1", "mt-6 mb-2 font-semibold text-3xl"),
  h2: createMotionComponent("h2", "mt-6 mb-2 font-semibold text-2xl"),
  h3: createMotionComponent("h3", "mt-6 mb-2 font-semibold text-xl"),
  h4: createMotionComponent("h4", "mt-6 mb-2 font-semibold text-lg"),
  h5: createMotionComponent("h5", "mt-6 mb-2 font-semibold text-base"),
  h6: createMotionComponent("h6", "mt-6 mb-2 font-semibold text-sm")
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
    logger.error("Error processing footnotes", {
      error: error instanceof Error ? error.message : String(error)
    });
    Sentry.captureException(error, {
      tags: {
        component: "ai-response",
        operation: "transformCitationsToFootnotes"
      }
    });
    return text;
  }
}

function transformCitationsToLinks(text: string): string {
  try {
    // First try footnote transformation
    const footnoteTransformed = transformCitationsToFootnotes(text);
    if (footnoteTransformed !== text) {
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

    return text;
  } catch (error) {
    logger.error("Error in transformCitationsToLinks", {
      error: error instanceof Error ? error.message : String(error)
    });
    Sentry.captureException(error, {
      tags: { component: "ai-response", operation: "transformCitationsToLinks" }
    });
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
