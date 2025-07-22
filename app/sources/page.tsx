import { Suspense } from "react";
import { SourcesPageContent } from "./components/SourcesPageContent";
import { SourcesPageFallback } from "./components/skeletons";
import { getAllLexiconEntries } from "@/lib/utils/lexicon-db";
import { getAllTestimonies } from "@/lib/utils/testimony";
import { LexiconSource, TestimonySource } from "./types";
import { sourcesPageConstants } from "./constants";

/**
 * @file This file defines the main page for the sources section.
 * It fetches lexicon and testimony data, formats it for display, and renders the main sources page component.
 * It also includes a fallback skeleton for a better user experience during data loading.
 */

async function getSources() {
  const lexiconEntries = await getAllLexiconEntries();
  const testimonyEntries = await getAllTestimonies();

  const lexiconSources: LexiconSource[] = lexiconEntries.map(
    (entry, index) => ({
      id: entry.id || `lexicon-${index}`,
      filename: entry.filename,
      title: entry.title,
      content: entry.content,
      pdfFile: entry.pdfFile,
      pdfUrl: entry.pdfUrl,
      txtUrl: entry.txtUrl,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      description: `${sourcesPageConstants.lexiconOverlay.title} entry: ${entry.title}`,
      tags: [],
      featured: Math.random() < 0.2
    })
  );

  const testimonySources: TestimonySource[] = testimonyEntries.map((entry) => {
    let contentPreview = `Survivor testimony: ${entry.survivor_name}`;

    if (entry.content) {
      // Remove timestamp markers for preview
      const content = entry.content.replace(/\[[\d:]+\]/g, "");
      const lines = content.split("\n").filter((line) => line.trim());

      const survivorLines = lines.filter(
        (line) =>
          !line.trim().startsWith("David Boder:") &&
          !line.trim().startsWith("Dr. Boder:") &&
          !line.trim().startsWith("DAVID BODER:") &&
          line.trim().length > 50
      );

      if (survivorLines.length > 0) {
        contentPreview = survivorLines.slice(0, 3).join(" ").substring(0, 200);
        if (contentPreview.length >= 200) contentPreview += "...";
      }
    }

    return {
      id: entry.id,
      filename: entry.filename,
      survivor_name: entry.survivor_name,
      title: entry.survivor_name, // Use survivor name as title for display
      description: entry.description || contentPreview,
      tags: [],
      featured: Math.random() < 0.2,
      testimony_language: entry.testimony_language,
      interviewer: entry.interviewer,
      location: entry.location,
      url: entry.url
    };
  });

  return { lexiconSources, testimonySources };
}

export default async function SourcesPage() {
  const { lexiconSources, testimonySources } = await getSources();

  return (
    <div className="flex-1 min-h-0">
      <Suspense fallback={<SourcesPageFallback />}>
        <SourcesPageContent
          lexiconSources={lexiconSources}
          testimonySources={testimonySources}
        />
      </Suspense>
    </div>
  );
}
