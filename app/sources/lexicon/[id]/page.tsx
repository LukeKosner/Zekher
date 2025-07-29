import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getLexiconEntryBySlug } from "@/lib/database";
import { LexiconPageFallback } from "@/app/sources/components/skeletons";
import { LexiconPageClient } from "./client";

/**
 * Server component for lexicon content
 */
async function LexiconPageContent(props: any) {
  try {
    const params = await props.params;
    const id = params.id;

    if (!id) {
      notFound();
    }

    // Get the lexicon entry from database using ID
    const lexiconEntry = await getLexiconEntryBySlug(id);

    if (!lexiconEntry) {
      notFound();
    }

    // Check if this entry should redirect to an external URL
    if (lexiconEntry.redirectUrl) {
      redirect(lexiconEntry.redirectUrl);
    }

    return <LexiconPageClient lexiconEntry={lexiconEntry} />;
  } catch (error) {
    console.error("Error loading Lexicon entry:", error);
    notFound();
  }
}

/**
 * Main Lexicon page component with Suspense wrapper
 */
export default function LexiconPage(props: any) {
  return (
    <Suspense fallback={<LexiconPageFallback />}>
      <LexiconPageContent {...props} />
    </Suspense>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata(props: any) {
  try {
    const params = await props.params;
    const id = params.id;

    if (!id) {
      return {
        title: "Lexicon Entry Not Found",
        description: "The requested Lexicon entry could not be found."
      };
    }

    // Get the title from the database
    const lexiconEntry = await getLexiconEntryBySlug(id);

    if (!lexiconEntry) {
      return {
        title: "Lexicon Entry Not Found",
        description: "The requested Lexicon entry could not be found."
      };
    }

    const displayTitle = lexiconEntry.title || `Entry ${id}`;

    return {
      title: `${displayTitle} - Holocaust Lexicon - Zekher`,
      description: `Holocaust Lexicon entry: ${displayTitle}. From Yad Vashem's authoritative Holocaust education resources.`,
      keywords: [
        "Holocaust",
        "Lexicon",
        "Yad Vashem",
        displayTitle,
        "Holocaust education",
        "Holocaust history"
      ],
      openGraph: {
        title: `${displayTitle} - Holocaust Lexicon`,
        description: `Holocaust Lexicon entry: ${displayTitle}. From Yad Vashem's authoritative Holocaust education resources.`,
        type: "article"
      }
    };
  } catch (error) {
    console.error("Error generating metadata for Lexicon entry:", error);
    return {
      title: "Holocaust Lexicon",
      description: "Yad Vashem Holocaust Lexicon entry"
    };
  }
}
