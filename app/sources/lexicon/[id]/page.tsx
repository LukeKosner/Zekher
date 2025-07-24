/**
 * @file This file defines the page for displaying a single lexicon entry.
 * It fetches the lexicon entry data based on the slug and displays it in a PDF viewer.
 * It also includes a fallback skeleton for a better user experience during data loading.
 */

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getLexiconEntryBySlug } from "@/lib/utils/lexicon";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { LexiconPageFallback } from "@/app/sources/components/skeletons";
import Link from "next/link";

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

    // Use the authoritative PDF URL directly from database
    const displayTitle = lexiconEntry.title;
    const pdfUrl = lexiconEntry.pdfUrl || undefined;

    // Debug: Log the PDF URL from database
    console.log(`PDF URL from database for ${id} (${displayTitle}):`, pdfUrl);

    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">{displayTitle}</h1>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* PDF Viewer Card */}
        <div className="mb-8">
          <div className="w-full h-[800px] rounded-lg border bg-card">
            <object
              data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              width="100%"
              height="100%"
              className="w-full h-full rounded-lg"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-muted/10 rounded-lg">
                <div className="max-w-md space-y-4">
                  <h2 className="text-xl font-semibold">
                    Lexicon Entry: {displayTitle}
                  </h2>
                  <p className="text-muted-foreground">
                    This PDF document contains important Holocaust Lexicon
                    information. Your browser may not support embedded PDF
                    viewing, but you can access the content using the options
                    below.
                  </p>
                  <div className="text-xs text-muted-foreground/70 font-mono bg-muted/20 p-2 rounded">
                    URL: {pdfUrl}
                  </div>
                  <div className="flex gap-2 justify-center">
                    {pdfUrl && (
                      <>
                        <a
                          href={pdfUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </a>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                          </Button>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </object>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-muted-foreground text-center">
          <p>
            This entry comes from Yad Vashem's{" "}
            <Link href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html">
              Holocaust Lexicon
            </Link>
            . Zekher hosts these documents to avoid putting pressure on Yad
            Vashem's servers. Zekher claims no ownership over the content.
          </p>
        </div>
      </div>
    );
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
      title: `${displayTitle} - Holocaust Lexicon`,
      description: `Holocaust Lexicon entry: ${displayTitle}`
    };
  } catch (error) {
    console.error("Error generating metadata for Lexicon entry:", error);
    return {
      title: "Holocaust Lexicon",
      description: "Yad Vashem Holocaust Lexicon entry"
    };
  }
}