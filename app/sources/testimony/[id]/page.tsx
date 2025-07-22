
/**
 * @file This file defines the page for displaying a single testimony.
 * It fetches the testimony data based on the filename and displays it in a readable format.
 * It also includes a fallback skeleton for a better user experience during data loading.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTestimonyBySlug } from "@/lib/utils/testimony";
import { TestimonyPageClient } from "./TestimonyPageClient";
import { TestimonyPageFallback } from "@/app/sources/components/skeletons";


/**
 * Server component for data fetching
 */
async function TestimonyPageContent(props: any) {
  const testimony = await getTestimonyBySlug(props.params.id);
  
  if (!testimony) {
    notFound();
  }

  return <TestimonyPageClient testimony={testimony} />;
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
    const testimony = await getTestimonyBySlug(props.params.id);
    
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
