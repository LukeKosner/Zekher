/**
 * Chat Testimony Carousel Component
 * 
 * Simple testimony carousel for chat interface - restores original UI
 */

"use client";

import {
  Users,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ExternalLink
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
import { generateAudioUrl } from "@/lib/utils/url-generation";
import Link from "next/link";

// Utility function to truncate text for display
const truncateText = (text: string, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

interface TestimonyEntry {
  id?: string;
  survivorName: string;
  title: string;
  excerpt: string;
  timeReference?: string;
  location?: string;
  relevanceScore: number;
  fullTranscript?: string;
  citation: string;
  filename: string;
  url?: string;
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
          <Carousel className="w-full max-w-full mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {sources.map((testimony, index) => {
                const testimonyUrl = testimony.filename ? `/sources/testimony/${testimony.filename}` : '#';
                
                return (
                  <CarouselItem key={testimony.filename || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <a
                        href={testimonyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative group/testimony-item cursor-pointer"
                        title={`${testimony.survivorName} - Dr. David P. Boder Collection`}
                      >
                        <div className="relative w-full h-[400px] rounded-md overflow-hidden bg-muted/30 border">
                          {/* Testimony Preview Content */}
                          <div className="p-4 h-full flex flex-col transition-all duration-200 group-hover/testimony-item:brightness-50">
                            {/* Header */}
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-semibold mb-1">
                                {truncateText(testimony.survivorName, 30)}
                              </h3>
                              {(testimony.location || testimony.timeReference) && (
                                <p className="text-muted-foreground text-xs">
                                  {testimony.location}
                                  {testimony.location && testimony.timeReference && ` • `}
                                  {testimony.timeReference}
                                </p>
                              )}
                            </div>

                            {/* Content Preview */}
                            <div className="flex-1 overflow-hidden">
                              <div className="space-y-3 max-h-full overflow-y-auto group-hover/testimony-item:overflow-hidden">
                                {parseTimestamps(testimony.fullTranscript || testimony.excerpt || '').slice(0, 5).map((segment, segIndex) => (
                                  <div key={segIndex} className="text-xs">
                                    <div className="font-mono text-blue-600 mb-1">
                                      [{segment.timestamp}]
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                      {segment.text.length > 180 ? segment.text.slice(0, 180) + '...' : segment.text}
                                    </p>
                                  </div>
                                ))}
                                {parseTimestamps(testimony.fullTranscript || testimony.excerpt || '').length === 0 && (
                                  <p className="text-muted-foreground text-xs leading-relaxed">
                                    {testimony.excerpt && testimony.excerpt.length > 300 
                                      ? testimony.excerpt.slice(0, 300) + '...' 
                                      : testimony.excerpt || "No transcript segments available"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 group-hover/testimony-item:flex hidden flex-col items-center justify-center pointer-events-none transition-all duration-200">
                            <div className="flex flex-col items-center">
                              {/* Title and source info */}
                              <div className="bg-white bg-opacity-95 text-black px-3 py-2 rounded-lg mb-3 max-w-[90%] text-center shadow-lg">
                                <div className="font-semibold text-sm">{truncateText(testimony.survivorName, 30)}</div>
                                <div className="text-xs text-gray-600">Survivor Testimony</div>
                              </div>
                              
                              {/* Action button */}
                              <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium shadow-lg">
                                <ExternalLink className="size-4" />
                                View Full Testimony
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                      
                      {/* Credit link below the card */}
                      <div className="mt-2 text-center">
                        <p className="text-xs text-muted-foreground">
                          {testimony.url ? (
                            <a 
                              href={testimony.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors underline"
                              title="View original source"
                            >
                              Dr. David P. Boder Collection
                            </a>
                          ) : (
                            <a 
                              href="https://voices.library.iit.edu/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors underline"
                              title="Visit David P. Boder Collection"
                            >
                              Dr. David P. Boder Collection
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 md:left-4" />
            <CarouselNext className="right-0 md:right-4" />
          </Carousel>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};