/**
 * Interactive Testimony Card Component
 *
 * Displays survivor testimony entries with hover overlay showing "Read Full Testimony" action.
 * Follows Shadcn UI design patterns with respectful, accessible interactions.
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { TestimonyCardProps } from "@/app/sources/types";
import { cn } from "@/lib";
import { generateSourceUrl } from "@/lib";
import { sourcesPageConstants } from "../constants";
import Link from "next/link";

export function TestimonyCard({ source, className }: TestimonyCardProps) {
  const name =
    source.survivor_name ||
    source.filename?.replace(/\.txt$/i, "") ||
    "Unknown";
  const description = source.description || `Survivor testimony by ${name}`;
  // Use ID directly as the URL identifier
  const fullPageUrl = generateSourceUrl({
    pageType: "testimony",
    filename: source.id
  });

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sourcesPageConstants.cardText.testimony.source}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative w-full h-48 rounded-md overflow-hidden border bg-muted/10">
          <div className="p-4 h-full">
            <p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={fullPageUrl} className="w-full">
          <Button variant="outline" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            {sourcesPageConstants.cardText.testimony.readFull}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
