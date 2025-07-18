"use client";

import {
  Users,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { useState, useRef } from "react";
import {
  generateSourceUrl,
  generateAudioUrl
} from "@/lib/utils/url-generation";

interface TestimonyEntry {
  survivorName: string;
  title: string;
  excerpt: string;
  timeReference?: string;
  location?: string;
  relevanceScore: number;
  fullTranscript?: string;
  citation: string;
  filename: string;
}

interface TimestampSegment {
  timestamp: string;
  text: string;
  startTimeSeconds: number;
}

interface TestimonyCarouselProps {
  status: string;
  name: string;
  sources: TestimonyEntry[];
}

export const TestimonyCarousel = ({
  status,
  name,
  sources
}: TestimonyCarouselProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [playingSegment, setPlayingSegment] = useState<{
    testimony: TestimonyEntry;
    segmentIndex: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentPlayPromise = useRef<Promise<void> | null>(null);

  // Parse timestamps from testimony content
  const parseTimestamps = (content: string): TimestampSegment[] => {
    if (!content) return [];

    const timestampRegex = /\[(\d{2}:\d{2}:\d{2})\]/g;
    const segments: TimestampSegment[] = [];
    let match;

    while ((match = timestampRegex.exec(content)) !== null) {
      const timestamp = match[1];
      const startIndex = match.index + match[0].length;

      // Find the next timestamp or end of content
      const nextMatch = timestampRegex.exec(content);
      const endIndex = nextMatch ? nextMatch.index : content.length;
      timestampRegex.lastIndex = nextMatch ? nextMatch.index : content.length;

      const text = content.substring(startIndex, endIndex).trim();

      // Convert timestamp to seconds
      const [hours, minutes, seconds] = timestamp.split(":").map(Number);
      const startTimeSeconds = hours * 3600 + minutes * 60 + seconds;

      if (text) {
        segments.push({
          timestamp,
          text,
          startTimeSeconds
        });
      }
    }

    return segments;
  };

  const handleTimestampClick = async (
    testimony: TestimonyEntry,
    segment: TimestampSegment,
    segmentIndex: number,
    allSegments: TimestampSegment[]
  ) => {
    // Use centralized audio URL generation with proper blob URL fallback
    const audioFile = generateAudioUrl({ speakerName: testimony.survivorName });

    // If this segment is already playing, pause it
    if (
      playingSegment?.testimony === testimony &&
      playingSegment?.segmentIndex === segmentIndex
    ) {
      // Cancel any pending play promise
      currentPlayPromise.current = null;

      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSegment(null);
      return;
    }

    // Stop any currently playing audio and clean up
    if (audioRef.current) {
      // Cancel any pending play promise
      currentPlayPromise.current = null;
      
      // Pause current audio
      audioRef.current.pause();
      
      // Remove any existing event listeners
      const oldListeners = audioRef.current.cloneNode(true) as HTMLAudioElement;
      audioRef.current.replaceWith(oldListeners);
      audioRef.current = oldListeners;
    }

    // Set new playing segment
    setPlayingSegment({ testimony, segmentIndex });

    if (audioRef.current) {
      audioRef.current.src = audioFile;
      audioRef.current.currentTime = segment.startTimeSeconds;

      // Calculate end time (next segment start or add 30 seconds)
      const nextSegment = allSegments[segmentIndex + 1];
      const endTime = nextSegment
        ? nextSegment.startTimeSeconds
        : segment.startTimeSeconds + 30;

      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setPlayingSegment(null);
          currentPlayPromise.current = null;
        }
      };

      const handleEnded = () => {
        setPlayingSegment(null);
        currentPlayPromise.current = null;
      };

      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("ended", handleEnded, { once: true });

      // Store the play promise and handle it properly
      const playPromise = audioRef.current.play();
      currentPlayPromise.current = playPromise;

      // Handle the play promise according to web standards
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Only proceed if this is still the current promise (not cancelled)
            if (currentPlayPromise.current === playPromise) {
              // Playback started successfully
            }
          })
          .catch((error) => {
            // Only handle error if this is still the current promise
            if (currentPlayPromise.current === playPromise) {
              console.error("Audio playback failed:", error);
              setPlayingSegment(null);
              currentPlayPromise.current = null;

              // Clean up event listeners if playback failed
              if (audioRef.current) {
                audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
                audioRef.current.removeEventListener("ended", handleEnded);
              }
            }
          });
      }
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="not-prose mb-4 w-full rounded-md border"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">{name}</span>
          <Badge className="rounded-full text-xs" variant="secondary">
            {status === "result" ? (
              <CheckCircleIcon className="size-4 text-green-600" />
            ) : (
              <ClockIcon className="size-4 animate-pulse" />
            )}
            {status === "result" ? "Completed" : "Finding survivor testimonies..."}
          </Badge>
        </div>
        {status === "result" && (
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </CollapsibleTrigger>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {status === "result" && (
        <CollapsibleContent className="grid gap-4 overflow-hidden border-t p-4 text-sm">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {sources.map((testimony, index) => {
                const timestamps = parseTimestamps(
                  testimony.fullTranscript || testimony.excerpt || ""
                );

                return (
                  <CarouselItem key={testimony.filename || index}>
                    <div className="p-1">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold mb-1">
                          {testimony.survivorName}
                        </h3>
                        {(testimony.location || testimony.timeReference) && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {testimony.location}
                            {testimony.location &&
                              testimony.timeReference &&
                              ` • `}
                            {testimony.timeReference}
                          </p>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-3 bg-muted/30 rounded-lg p-4">
                        {timestamps.length > 0 ? (
                          timestamps.map((segment, segIndex) => {
                            const isPlaying =
                              playingSegment?.testimony === testimony &&
                              playingSegment?.segmentIndex === segIndex;
                            return (
                              <div key={segIndex} className="group">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 mb-1 h-auto p-1 font-mono"
                                  onClick={() =>
                                    handleTimestampClick(
                                      testimony,
                                      segment,
                                      segIndex,
                                      timestamps
                                    )
                                  }
                                >
                                  {isPlaying ? (
                                    <PauseIcon className="size-3 mr-1" />
                                  ) : (
                                    <PlayIcon className="size-3 mr-1" />
                                  )}
                                  {segment.timestamp}
                                </Button>
                                <p className="text-sm leading-relaxed pl-2 border-l-2 border-muted">
                                  {segment.text}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <p className="text-sm leading-relaxed">
                              {testimony.excerpt ||
                                "No transcript segments available"}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {sources.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
