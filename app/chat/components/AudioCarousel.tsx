/**
 * AudioCarousel component for displaying multiple audio segments in a carousel
 */

import { AudioWaveform } from "lucide-react";
import { Carousel } from "./Carousel";
import { CarouselItem } from "@/components/ui/carousel";
import { AudioPlayer } from "./AudioPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { AudioSegment } from "../types";

export interface AudioCarouselProps {
  status: "result" | "loading";
  name: string;
  segments: AudioSegment[];
}

export const AudioCarousel = ({
  status,
  name,
  segments
}: AudioCarouselProps) => {
  return (
    <Carousel
      name={name}
      status={status}
      icon={<AudioWaveform className="size-4 text-muted-foreground" />}
    >
      {segments.map((segment, index) => (
        <CarouselItem
          key={`${segment.testimonyId}-${segment.startTime}-${index}`}
          className="pl-2 md:pl-4 basis-full xl:basis-1/2 flex"
        >
          <div className="flex flex-col w-full">
            <ErrorBoundary
              componentName="AudioPlayer"
              fallback={
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex-1 flex flex-col justify-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unable to load audio segment from {segment.speakerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    &quot;{segment.transcriptExcerpt}&quot;
                  </p>
                </div>
              }
            >
              <AudioPlayer segment={segment} className="flex-1" />
            </ErrorBoundary>
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  );
};
