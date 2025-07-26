/**
 * Interactive Lexicon Card Component
 *
 * Displays lexicon entries with a header, description, PDF preview, and full-screen action.
 * Follows Shadcn UI design patterns with respectful, accessible interactions.
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, ArrowUpRight } from "lucide-react";
import { LexiconCardProps } from "@/app/sources/types";
import { cn } from "@/lib";
import { generateSourceUrl } from "@/lib";
import { sourcesPageConstants } from "@/app/sources/constants";
import Link from "next/link";

export function LexiconCard({ source, className }: LexiconCardProps) {
  // Use the authoritative title from the database
  const displayTitle =
    source.title || source.filename?.replace(/\.pdf$/i, "") || "Untitled";

  // Check if this is a redirect entry
  const isRedirect = !!source.redirectUrl;

  // Use authoritative PDF URL from database
  const pdfUrl = source.pdfUrl;
  const txtUrl = source.txtUrl;

  // Use ID directly as the URL identifier for internal navigation
  const routeUrl = generateSourceUrl({
    pageType: "lexicon",
    filename: source.id
  });

  if (
    displayTitle.toLowerCase().includes("ab-aktion") ||
    source.title?.toLowerCase().includes("ab-aktion")
  ) {
    console.log("🎯 AB-Aktion routeUrl generated:", routeUrl);
  }

  // State for txt preview
  const [txtPreview, setTxtPreview] = React.useState<string>("");
  React.useEffect(() => {
    if (txtUrl) {
      fetch(txtUrl)
        .then((res) => (res.ok ? res.text() : ""))
        .then((text) => {
          // Show only first 500 chars for preview
          setTxtPreview(text.slice(0, 500));
        });
    }
  }, [txtUrl]);

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{displayTitle}</CardTitle>
            <CardDescription>
              {isRedirect
                ? sourcesPageConstants.cardText.lexicon.externalSource
                : sourcesPageConstants.cardText.lexicon.source}
            </CardDescription>
          </div>
          {!isRedirect && pdfUrl && (
            <a
              href={`${pdfUrl}#toolbar=0`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Download className="h-5 w-5" />
              </Button>
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isRedirect ? (
          // Show text preview for redirect entries
          txtUrl &&
          txtPreview && (
            <div className="relative w-full h-48 rounded-md overflow-hidden border mb-4 bg-muted p-3">
              <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground h-full overflow-auto">
                {txtPreview}
                {txtPreview.length === 500 ? "..." : ""}
              </pre>
            </div>
          )
        ) : (
          // Show PDF preview for regular entries
          <>
            {pdfUrl && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border mb-4">
                <object
                  data={`${pdfUrl}#toolbar=0`}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0"
                >
                  <div className="p-4 text-sm text-muted-foreground">
                    <p>
                      {sourcesPageConstants.cardText.lexicon.pdfPreviewFallback}
                    </p>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {sourcesPageConstants.cardText.lexicon.openInNewTab}
                    </a>
                  </div>
                </object>
              </div>
            )}
            {txtUrl && txtPreview && !pdfUrl && (
              <div className="bg-muted rounded p-3 text-xs text-muted-foreground mb-2 max-h-32 overflow-auto border">
                <div className="font-semibold mb-1">Text Preview</div>
                <pre className="whitespace-pre-wrap break-words">
                  {txtPreview}
                  {txtPreview.length === 500 ? "..." : ""}
                </pre>
                <a
                  href={routeUrl + "?view=txt"}
                  className="text-blue-500 hover:underline text-xs mt-2 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sourcesPageConstants.cardText.lexicon.viewFullText}
                </a>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {isRedirect ? (
          <a
            href={source.redirectUrl || "#"}
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {sourcesPageConstants.cardText.lexicon.visitExternal}
            </Button>
          </a>
        ) : (
          <>
            {pdfUrl ? (
              <Link href={routeUrl} className="w-full">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {sourcesPageConstants.cardText.lexicon.viewFullPdf}
                </Button>
              </Link>
            ) : (
              txtUrl && (
                <Link href={routeUrl + "?view=txt"} className="w-full">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {sourcesPageConstants.cardText.lexicon.viewFullText}
                  </Button>
                </Link>
              )
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
