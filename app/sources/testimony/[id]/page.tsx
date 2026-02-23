/**
 * @file This file defines the page for displaying a single testimony.
 * It fetches the testimony data based on the filename and displays it in a readable format.
 * It also includes a fallback skeleton for a better user experience during data loading.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TestimonyPageClient } from "./TestimonyPageClient";
import { TestimonyPageFallback } from "@/app/sources/components/skeletons";

/**
 * Server component for data fetching
 */
async function TestimonyPageContent(props: any) {
  const params = await props.params;
  const testimony = await fetchQuery(api.sources.getTestimonyBySourceId, {
    sourceId: params.id,
  });

  if (!testimony) {
    notFound();
  }

  // Convert database testimony to client format
  const clientTestimony = {
    id: testimony.sourceId,
    survivor_name: testimony.survivor_name,
    filename: testimony.filename,
    content: testimony.content,
    testimony_language: testimony.testimony_language || undefined,
    interviewer: testimony.interviewer || undefined,
    date: testimony.date || undefined,
    location: testimony.location || undefined,
    description: testimony.description || undefined,
    createdAt: testimony.createdAt
      ? new Date(testimony.createdAt).toISOString()
      : undefined
  };

  return <TestimonyPageClient testimony={clientTestimony} />;
}

/**
 * Main page component with Suspense wrapper
 */
export default function TestimonyPage(props: any) {
  return (
    <Suspense fallback={<TestimonyPageFallback />}>
      <TestimonyPageContent {...props} />
    </Suspense>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata(props: any) {
  try {
    const params = await props.params;
    const testimony = await fetchQuery(api.sources.getTestimonyBySourceId, {
      sourceId: params.id,
    });

    if (!testimony) {
      return {
        title: "Testimony Not Found",
        description: "The requested testimony could not be found."
      };
    }

    return {
      title: `${testimony.survivor_name} - Survivor Testimony - Zekher`,
      description:
        testimony.description ||
        `Holocaust survivor testimony by ${testimony.survivor_name}. From Dr. David P. Boder's interview collection.`,
      keywords: [
        "Holocaust survivor",
        "testimony",
        "David Boder",
        testimony.survivor_name,
        "Holocaust history",
        "survivor stories"
      ],
      openGraph: {
        title: `${testimony.survivor_name} - Survivor Testimony`,
        description:
          testimony.description ||
          `Holocaust survivor testimony by ${testimony.survivor_name}. From Dr. David P. Boder's interview collection.`,
        type: "article"
      }
    };
  } catch (error) {
    return {
      title: "Testimony",
      description: "Holocaust survivor testimony"
    };
  }
}
