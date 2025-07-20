/**
 * Interactive Lexicon Card Component
 * 
 * Displays lexicon entries with hover overlay showing "View Full PDF" action.
 * Follows Shadcn UI design patterns with respectful, accessible interactions.
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";
import { getLexiconUrl } from "@/lib/utils/blob-urls";
import { sourcesPageConstants } from "@/lib/prompts";
import { LexiconCardProps } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Interactive card component for lexicon entries
 * Shows entry title and source info with hover overlay for PDF access
 */
export function LexiconCard({ source, className }: LexiconCardProps) {
  const title = source.title || source.filename.replace(/\.pdf$/i, "");
  const pdfUrl = getLexiconUrl(source.filename);
  const { lexiconOverlay } = sourcesPageConstants;

  return (
    <Card className={cn("relative group w-full rounded border bg-card text-card-foreground", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>
        <CardContent className="px-0">
          <p className="text-sm text-muted-foreground">
            {lexiconOverlay.title} entry
          </p>
        </CardContent>
      </CardHeader>

      {/* Hover overlay with link */}
      <a
        href={pdfUrl}
        target="_blank" 
        rel="noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 rounded"
        aria-label={`View full PDF: ${title}`}
      >
        <span className="text-white flex items-center gap-2 px-3 py-2 border border-white rounded bg-black/20 backdrop-blur-sm">
          <FileTextIcon className="w-4 h-4" aria-hidden="true" /> 
          <span>{lexiconOverlay.actionText}</span>
        </span>
      </a>
    </Card>
  );
}