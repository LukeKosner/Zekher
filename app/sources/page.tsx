import { Suspense } from "react";
import { SourcesPageContent } from "@/components/sources/SourcesPageContent";

function SourcesPageFallback() {
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
        <h2 className="text-xl font-semibold mb-2">Loading Sources</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load the source content...
        </p>
      </div>
    </div>
  );
}

export default function SourcesPage() {
  return (
    <Suspense fallback={<SourcesPageFallback />}>
      <SourcesPageContent />
    </Suspense>
  );
}
