// components/audio/AudioPlayerSuspense.tsx
// Optimized Audio Player with Suspense boundaries

'use client';

import {Suspense} from 'react';
import {ErrorBoundary} from '@/components/ErrorBoundary';
import {AudioPlayer} from '@/components/audio/AudioPlayer';

interface AudioSegment {
  testimonyId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  transcriptExcerpt: string;
  language?: string;
  significance: string;
  audioFile: string;
}

interface AudioPlayerSuspenseProps {
  segment: AudioSegment;
  className?: string;
}

function AudioPlayerFallback() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function AudioPlayerSuspense({
  segment,
  className,
}: AudioPlayerSuspenseProps) {
  return (
    <ErrorBoundary
      componentName="Audio Player"
      fallback={
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Failed to load audio player. Please try refreshing the page.
          </p>
        </div>
      }
    >
      <Suspense fallback={<AudioPlayerFallback />}>
        <AudioPlayer segment={segment} className={className} />
      </Suspense>
    </ErrorBoundary>
  );
}
