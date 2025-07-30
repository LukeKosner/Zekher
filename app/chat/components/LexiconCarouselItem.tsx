"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CarouselItem as UICarouselItem } from "@/components/ui/carousel";
import { generateSourceUrl } from "@/lib";
import type { LexiconCarouselEntry } from "../types";

// PDF.js component for rendering PDF without Safari toolbar
const PDFPreview = ({ url, className }: { url: string; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPDF = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;

        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        
        if (!canvas || !isMounted) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 1 });
        
        // Calculate scale to match object tag behavior (fill width, clip height if needed)
        const containerWidth = canvas.parentElement?.offsetWidth || 300;
        const containerHeight = canvas.parentElement?.offsetHeight || 200;
        
        // High-DPI rendering: render at 2x resolution for crisp display
        const pixelRatio = window.devicePixelRatio || 1;
        const highDPIScale = 2; // Always render at 2x for better quality
        
        // Scale to fill the container width, then multiply by high-DPI scale
        const baseScale = containerWidth / viewport.width;
        const scale = baseScale * highDPIScale;
        const scaledViewport = page.getViewport({ scale });
        
        // Set canvas internal size (high resolution)
        canvas.width = containerWidth * highDPIScale;
        canvas.height = Math.min(scaledViewport.height, containerHeight * highDPIScale);
        
        // Set canvas display size (actual size shown)
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${Math.min(scaledViewport.height / highDPIScale, containerHeight)}px`;
        
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
        
        await page.render(renderContext).promise;
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.warn('PDF rendering failed:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPDF();
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground px-4 text-center">
        PDF preview not available
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-xs text-muted-foreground">
          Loading PDF preview...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        style={{ objectFit: 'contain', objectPosition: 'top center' }}
      />
    </div>
  );
};

export const LexiconCarouselItem = ({
  source,
  index,
  basisClass = "basis-full xl:basis-1/2"
}: {
  source: LexiconCarouselEntry;
  index: number;
  basisClass?: string;
}) => {
  const [txtPreview, setTxtPreview] = useState("");
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          setIsInView(true);
          observer.unobserve(element); // Only trigger once
        }
      },
      { 
        rootMargin: "0px", // No pre-loading margin
        threshold: 0.3 // Require 30% of element to be visible
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && source.txtUrl && !source.pdfUrl) {
      fetch(source.txtUrl)
        .then((res) => (res.ok ? res.text() : ""))
        .then((text) => {
          setTxtPreview(text.slice(0, 500));
        })
        .catch((error) => {
          console.warn("Failed to fetch text preview:", error);
          setTxtPreview(""); // Silently fail for preview
        });
    }
  }, [isInView, source.txtUrl, source.pdfUrl]);

  // Generate the internal citation URL for navigating to the lexicon page
  const internalUrl = source.id
    ? generateSourceUrl({
        pageType: "lexicon",
        filename: source.id
      })
    : "#";

  return (
    <UICarouselItem
      key={source.id || index}
      className={`pl-2 md:pl-4 ${basisClass}`}
      ref={elementRef}
    >
      {/* Cropped preview - navigate to lexicon page */}
      <Link
        href={internalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md border overflow-hidden h-56 cursor-pointer hover:opacity-90 transition-opacity relative"
      >
        {source.pdfUrl ? (
          isInView ? (
            <PDFPreview url={source.pdfUrl} className="absolute inset-0" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground px-4 text-center">
              Loading PDF preview...
            </div>
          )
        ) : (
          <div className="h-full w-full overflow-y-auto bg-muted/30 p-3">
            <h3 className="text-sm font-semibold">{source.title}</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-2">
              {txtPreview}
              {txtPreview.length === 500 ? "..." : ""}
            </p>
          </div>
        )}
      </Link>

      {/* Citation links */}
      <div className="mt-2 pt-2">
        <p className="text-xs text-gray-500 text-center">
          <Link
            href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
          >
            Yad Vashem
          </Link>
          {" • "}
          <Link 
            href={internalUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors underline"
          >
            View Entry
            <ExternalLink className="inline size-3 ml-1" />
          </Link>
        </p>
      </div>
    </UICarouselItem>
  );
};
