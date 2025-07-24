"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  LanguagesIcon,
  PlayIcon,
  PauseIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAudioUrl } from "@/lib/utils/url-generation";
import Link from "next/link";

/**
 * @file This file defines the client-side component for displaying a single testimony.
 * It includes the audio player, timestamp navigation, and formatted testimony content.
 */

interface TimestampSegment {
  timestamp: string;
  text: string;
  startTimeSeconds: number;
}

interface TestimonyData {
  id: string;
  survivor_name: string;
  filename: string;
  content: string;
  testimony_language?: string;
  interviewer?: string;
  date?: string;
  location?: string;
  description?: string;
  createdAt?: string;
}

/**
 * Formats testimony content for display
 * Handles timestamps and paragraph breaks
 */
function formatTestimonyContent(content: string): string[] {
  if (!content) return [];

  // Split by double newlines to create paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs;
}

export function TestimonyPageClient({
  testimony
}: {
  testimony: TestimonyData;
}) {
  const [playingSegment, setPlayingSegment] = useState<number | null>(null);
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

  const timestamps = parseTimestamps(testimony.content || "");

  const handleTimestampClick = async (
    segment: TimestampSegment,
    segmentIndex: number
  ) => {
    const audioFile = generateAudioUrl({
      speakerName: testimony.survivor_name
    });

    // If this segment is already playing, pause it
    if (playingSegment === segmentIndex) {
      currentPlayPromise.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSegment(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      currentPlayPromise.current = null;
      audioRef.current.pause();
    }

    setPlayingSegment(segmentIndex);

    if (audioRef.current) {
      audioRef.current.src = audioFile;
      audioRef.current.currentTime = segment.startTimeSeconds;

      // Calculate end time (next segment start or add 30 seconds)
      const nextSegment = timestamps[segmentIndex + 1];
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

      const playPromise = audioRef.current.play();
      currentPlayPromise.current = playPromise;

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (currentPlayPromise.current === playPromise) {
              // Playback started successfully
            }
          })
          .catch((error) => {
            if (currentPlayPromise.current === playPromise) {
              console.error("Audio playback failed:", error);
              setPlayingSegment(null);
              currentPlayPromise.current = null;
            }
          });
      }
    }
  };

  const paragraphs = formatTestimonyContent(testimony.content);
  const formattedDate = testimony.date
    ? new Date(testimony.date).toLocaleDateString()
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">{testimony.survivor_name}</h1>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3">
          {formattedDate && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              {formattedDate}
            </Badge>
          )}
          {testimony.location && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <MapPinIcon className="w-3 h-3" />
              {testimony.location}
            </Badge>
          )}
          {testimony.interviewer && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <UserIcon className="w-3 h-3" />
              {testimony.interviewer}
            </Badge>
          )}
          {testimony.testimony_language && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <LanguagesIcon className="w-3 h-3" />
              {testimony.testimony_language}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content - Audio Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Testimony</CardTitle>
        </CardHeader>
        <CardContent>
          {timestamps.length > 0 ? (
            <div className="space-y-4">
              {timestamps.map((segment, segmentIndex) => {
                const isPlaying = playingSegment === segmentIndex;
                return (
                  <div
                    key={segmentIndex}
                    className="group border-l-2 border-muted pl-4 py-3"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 mb-2 h-auto p-2 font-mono"
                      onClick={() =>
                        handleTimestampClick(segment, segmentIndex)
                      }
                    >
                      {isPlaying ? (
                        <PauseIcon className="size-4 mr-2" />
                      ) : (
                        <PlayIcon className="size-4 mr-2" />
                      )}
                      {segment.timestamp}
                    </Button>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground italic">
                  No testimony content available.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Footer */}
      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>
          This testimony comes from the{" "}
          <Link href="https://voices.library.iit.edu/">
            David P. Boder collection
          </Link>
          . Zekher hosts these documents to avoid putting pressure on Aviary
          servers. Zekher claims no ownership over this content.
          {testimony.createdAt && (
            <> Added on {new Date(testimony.createdAt).toLocaleDateString()}.</>
          )}
        </p>
      </div>
    </div>
  );
}
