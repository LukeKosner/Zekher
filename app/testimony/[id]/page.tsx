/**
 * Full Testimony Page
 * 
 * Displays complete survivor testimony content with proper formatting and metadata.
 * Fetches testimony data from database and renders in a readable format.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { testimonySources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UserIcon, LanguagesIcon } from "lucide-react";
import { sourcesPageConstants, errorMessages } from "@/lib/prompts";

interface TestimonyPageProps {
  params: {
    id: string;
  };
}

/**
 * Fetches testimony data from database by ID
 */
async function getTestimonyData(id: string) {
  try {
    const result = await db
      .select({
        id: testimonySources.id,
        survivor_name: testimonySources.survivor_name,
        filename: testimonySources.filename,
        content: testimonySources.content,
        testimony_language: testimonySources.testimony_language,
        interviewer: testimonySources.interviewer,
        date: testimonySources.date,
        location: testimonySources.location,
        description: testimonySources.description,
        createdAt: testimonySources.createdAt,
      })
      .from(testimonySources)
      .where(eq(testimonySources.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching testimony:", error);
    throw new Error(errorMessages.sources.systemError);
  }
}

/**
 * Formats testimony content for display
 * Handles timestamps and paragraph breaks
 */
function formatTestimonyContent(content: string): string[] {
  if (!content) return [];
  
  // Split by double newlines to create paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  return paragraphs;
}

/**
 * Loading component for testimony page
 */
function TestimonyPageFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto text-center">
        <div
          className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-4"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading Testimony</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load the testimony content...
        </p>
      </div>
    </div>
  );
}

/**
 * Main testimony page component
 */
async function TestimonyPageContent({ params }: TestimonyPageProps) {
  const testimony = await getTestimonyData(params.id);
  
  if (!testimony) {
    notFound();
  }

  const paragraphs = formatTestimonyContent(testimony.content);
  const formattedDate = testimony.date ? new Date(testimony.date).toLocaleDateString() : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {testimony.survivor_name}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {testimony.description || `Survivor testimony by ${testimony.survivor_name}`}
        </p>
        
        {/* Metadata */}
        <div className="flex flex-wrap gap-4 mb-6">
          {formattedDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {formattedDate}
            </Badge>
          )}
          {testimony.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {testimony.location}
            </Badge>
          )}
          {testimony.interviewer && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              Interviewer: {testimony.interviewer}
            </Badge>
          )}
          {testimony.testimony_language && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <LanguagesIcon className="w-3 h-3" />
              {testimony.testimony_language}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Testimony Transcript</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground italic">
              No transcript content available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>
          This testimony is part of the Zekher Holocaust Education Archive.
          {testimony.createdAt && (
            <> Added on {new Date(testimony.createdAt).toLocaleDateString()}.</>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * Main page component with Suspense wrapper
 */
export default function TestimonyPage({ params }: TestimonyPageProps) {
  return (
    <Suspense fallback={<TestimonyPageFallback />}>
      <TestimonyPageContent params={params} />
    </Suspense>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: TestimonyPageProps) {
  try {
    const testimony = await getTestimonyData(params.id);
    
    if (!testimony) {
      return {
        title: "Testimony Not Found",
        description: "The requested testimony could not be found."
      };
    }

    return {
      title: `${testimony.survivor_name} - Survivor Testimony`,
      description: testimony.description || `Holocaust survivor testimony by ${testimony.survivor_name}`,
    };
  } catch (error) {
    return {
      title: "Testimony",
      description: "Holocaust survivor testimony"
    };
  }
}