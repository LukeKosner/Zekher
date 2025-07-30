// app/sources/components/skeletons.tsx

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import * as motion from "motion/react-client";

export function LexiconCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-48 w-full rounded-md" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded" />
      </CardFooter>
    </Card>
  );
}

export function TestimonyCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative w-full h-48 rounded-md border bg-muted/10">
          <div className="p-4 h-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded" />
      </CardFooter>
    </Card>
  );
}

export function SourcesPageFallback() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 pb-20">
      <div className="text-center mb-8">
        <Skeleton className="h-9 w-80 mx-auto mb-4" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="w-full mx-auto mb-8">
        <div className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-lg mb-8">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>

        {/* Grid of card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LexiconCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LexiconPageFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-6 pt-12 pb-20"
    >
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-6" />

        {/* Action buttons skeleton */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-8 w-36 rounded" />
        </div>
      </div>

      {/* PDF Viewer Skeleton */}
      <div className="mb-8">
        <div className="w-full h-[800px] rounded-lg border bg-muted/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="flex gap-2 justify-center">
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-10 w-36 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-8 text-center">
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>
    </motion.div>
  );
}

export function TestimonyPageFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-6 pt-12 pb-20"
    >
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-6" />

        {/* Metadata Skeleton */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>

      {/* Audio Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="group border-l-2 border-muted pl-4 py-3"
              >
                <Skeleton className="h-8 w-24 mb-2 rounded" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Skeleton */}
      <div className="mt-8 mb-4 text-center">
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>
    </motion.div>
  );
}
