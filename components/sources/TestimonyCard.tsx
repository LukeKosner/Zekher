/**
 * Interactive Testimony Card Component
 * 
 * Displays survivor testimony entries with hover overlay showing "Read Full Testimony" action.
 * Follows Shadcn UI design patterns with respectful, accessible interactions.
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpenIcon } from "lucide-react";
import { sourcesPageConstants } from "@/lib/prompts";
import { TestimonyCardProps } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Interactive card component for testimony entries
 * Shows survivor name and description with hover overlay for full testimony access
 */
export function TestimonyCard({ source, className }: TestimonyCardProps) {
  const name = source.survivor_name || source.filename.replace(/\.txt$/i, "");
  const description = source.description || `Survivor testimony by ${name}`;
  const fullPageUrl = `/testimony/${source.id}`;
  const { testimonyOverlay } = sourcesPageConstants;

  return (
    <Card className={cn("relative group w-full rounded border bg-card text-card-foreground", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {name}
        </CardTitle>
        <CardContent className="px-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </CardContent>
      </CardHeader>

      {/* Hover overlay with link to full page */}
      <a
        href={fullPageUrl}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 rounded"
        aria-label={`Read full testimony by ${name}`}
      >
        <span className="text-white flex items-center gap-2 px-3 py-2 border border-white rounded bg-black/20 backdrop-blur-sm">
          <BookOpenIcon className="w-4 h-4" aria-hidden="true" /> 
          <span>{testimonyOverlay.actionText}</span>
        </span>
      </a>
    </Card>
  );
}