"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function LexiconPageClient({ lexiconEntry }: { lexiconEntry: any }) {
  const displayTitle = lexiconEntry.title;
  const pdfUrl = lexiconEntry.pdfUrl || undefined;
  const txtUrl = lexiconEntry.txtUrl || undefined;
  const [txtContent, setTxtContent] = useState("");

  useEffect(() => {
    if (txtUrl) {
      fetch(txtUrl)
        .then((res) => (res.ok ? res.text() : ""))
        .then((text) => {
          setTxtContent(text);
        });
    }
  }, [txtUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-6 pt-12 pb-20"
    >
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
              <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* PDF Viewer Card */}
      <div className="mb-8">
        <div className="w-full h-[800px] md:h-[800px] rounded-lg border bg-card overflow-hidden">
          {pdfUrl ? (
            <object
              data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              width="100%"
              height="100%"
              className="w-full h-full rounded-lg block max-w-full"
              style={{ maxHeight: '100%', maxWidth: '100%', containIntrinsicSize: '100% 100%' }}
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
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none p-6 h-full overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">{txtContent}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 mb-4 text-sm text-muted-foreground text-center">
        <p>
          This entry comes from Yad Vashem's{" "}
          <Link 
            href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
            className="text-foreground underline hover:no-underline inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Holocaust Lexicon
            <ExternalLink className="w-3 h-3" />
          </Link>
          . Zekher hosts these documents to avoid putting pressure on Yad
          Vashem's servers. Zekher claims no ownership over the content.
        </p>
      </div>
    </motion.div>
  );
}