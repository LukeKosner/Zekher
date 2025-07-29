"use client";

import { useEffect } from "react";

interface ExternalRedirectProps {
  url: string;
  title?: string;
}

export function ExternalRedirect({ url, title }: ExternalRedirectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Redirecting...</h1>
          <p className="text-muted-foreground leading-relaxed">
            {title ? `"${title}" is hosted externally. ` : "This content is hosted externally. "}
            You will be redirected to the source in a moment.
          </p>
          <div className="space-y-3">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Source →
            </a>
            <p className="text-xs text-muted-foreground">
              If you are not redirected automatically, click the button above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}