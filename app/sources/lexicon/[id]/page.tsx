import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { LexiconPageFallback } from "@/app/sources/components/skeletons";
import { LexiconPageClient } from "./client";
import { ExternalRedirect } from "./ExternalRedirect";

/**
 * Server component for lexicon content
 */
async function LexiconPageContent(props: any) {
  try {
    const params = await props.params;
    const id = params.id;

    console.log("LexiconPageContent: Looking for ID:", id);

    if (!id) {
      console.log("LexiconPageContent: No ID provided");
      notFound();
    }

    const lexiconEntry = await fetchQuery(api.sources.getLexiconEntryBySourceId, {
      sourceId: id
    });
    console.log("LexiconPageContent: Found entry:", !!lexiconEntry, lexiconEntry?.title);

    if (!lexiconEntry) {
      console.log("LexiconPageContent: Entry not found for ID:", id);
      notFound();
    }

    console.log("LexiconPageContent: Entry details:", {
      id: lexiconEntry.sourceId,
      title: lexiconEntry.title,
      hasRedirectUrl: !!lexiconEntry.redirectUrl,
      hasTxtUrl: !!lexiconEntry.txtUrl,
      hasPdfUrl: !!lexiconEntry.pdfUrl,
      redirectUrl: lexiconEntry.redirectUrl,
      txtUrl: lexiconEntry.txtUrl
    });

    // Check if this entry should redirect to an external URL
    // Priority: redirectUrl (explicit redirect) > txtUrl for txt-only sources
    const externalRedirectUrl = lexiconEntry.redirectUrl || 
      (lexiconEntry.txtUrl && !lexiconEntry.pdfUrl ? lexiconEntry.txtUrl : null);
    
    if (externalRedirectUrl) {
      console.log("LexiconPageContent: External redirect to:", externalRedirectUrl);
      return <ExternalRedirect url={externalRedirectUrl} title={lexiconEntry.title || undefined} />;
    }

    console.log("LexiconPageContent: No redirect needed, showing page");
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
    const lexiconEntry = await fetchQuery(api.sources.getLexiconEntryBySourceId, {
      sourceId: id
    });

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
