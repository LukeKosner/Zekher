"use client";

import { BookIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib";
import { generateSourceUrl } from "@/lib";

export type AISourcesProps = ComponentProps<"div">;

export const AISources = ({ className, ...props }: AISourcesProps) => (
  <Collapsible
    className={cn("not-prose mb-4 text-primary text-xs", className)}
    {...props}
  />
);

export type AISourcesTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  count: number;
};

export const AISourcesTrigger = ({
  className,
  count,
  children,
  ...props
}: AISourcesTriggerProps) => (
  <CollapsibleTrigger className="flex items-center gap-2" {...props}>
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4" />
      </>
    )}
  </CollapsibleTrigger>
);

export type AISourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const AISourcesContent = ({
  className,
  ...props
}: AISourcesContentProps) => (
  <CollapsibleContent
    className={cn("mt-3 flex flex-col gap-2", className)}
    {...props}
  />
);

export type AISourceProps = ComponentProps<"a">;

export const AISource = ({
  href,
  title,
  children,
  ...props
}: AISourceProps) => (
  <a
    className="flex items-center gap-2"
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        <BookIcon className="h-4 w-4" />
        <span className="block font-medium">{title}</span>
      </>
    )}
  </a>
);

// Utility to generate a /sources link for a citation
export function getSourceLink({
  type,
  id,
  speakerName,
  startTime,
  endTime,
  transcriptExcerpt,
  language,
  significance
}: {
  type: "lexicon" | "testimony" | "audio";
  id: string;
  speakerName?: string;
  startTime?: number;
  endTime?: number;
  transcriptExcerpt?: string;
  language?: string;
  significance?: string;
}): string {
  if (type === "lexicon") {
    return generateSourceUrl({ pageType: "lexicon", filename: id });
  }
  if (type === "testimony") {
    return generateSourceUrl({ pageType: "testimony", filename: id });
  }
  if (
    type === "audio" &&
    speakerName &&
    startTime !== undefined &&
    endTime !== undefined &&
    transcriptExcerpt &&
    significance
  ) {
    const params = new URLSearchParams({
      pageType: "audio",
      id,
      speakerName,
      startTime: String(startTime),
      endTime: String(endTime),
      transcriptExcerpt,
      significance
    });
    if (language) params.set("language", language);
    return `/sources?${params.toString()}`;
  }
  return "#";
}
