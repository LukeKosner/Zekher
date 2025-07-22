"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AudioPlayerProps {
  segment: AudioSegment;
  className?: string;
}

export function AudioPlayer({ segment, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset states when segment changes
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const segmentDuration = segment.endTime - segment.startTime;

    const setAudioData = () => {
      setDuration(segmentDuration);
      setCurrentTime(0);
      setIsLoading(false);
    };

    const setAudioTime = () => {
      const relativeTime = audio.currentTime - segment.startTime;
      setCurrentTime(Math.max(0, Math.min(relativeTime, segmentDuration)));
    };

    const handleLoadedMetadata = () => {
      // Ensure we start exactly at the segment start time
      audio.currentTime = segment.startTime;
      setAudioData();
    };

    const handleTimeUpdate = () => {
      // Strict enforcement: pause if we go beyond segment end time
      if (audio.currentTime >= segment.endTime) {
        audio.pause();
        setIsPlaying(false);
        // Reset to start of segment
        audio.currentTime = segment.startTime;
        setCurrentTime(0);
        return;
      }

      // Ensure we don't go before segment start time
      if (audio.currentTime < segment.startTime) {
        audio.currentTime = segment.startTime;
        setCurrentTime(0);
        return;
      }

      setAudioTime();
    };

    const handleSeeked = () => {
      // Prevent seeking outside the segment boundaries
      if (audio.currentTime < segment.startTime) {
        audio.currentTime = segment.startTime;
      } else if (audio.currentTime >= segment.endTime) {
        audio.currentTime = segment.endTime - 0.1; // Just before end
      }
      setAudioTime();
    };

    const handleError = () => {
      setError(
        "Unable to load audio recording. The transcript is available below."
      );
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    // Force reload of audio when segment changes
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeked", handleSeeked);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [segment.startTime, segment.endTime, segment.audioFile]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Always ensure we're within the segment boundaries before playing
      if (
        audio.currentTime < segment.startTime ||
        audio.currentTime >= segment.endTime
      ) {
        audio.currentTime = segment.startTime;
      }

      audio.play().catch(() => {
        setError("Unable to play audio. Please try again.");
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekPercent = parseFloat(e.target.value);
    const seekTime =
      segment.startTime +
      (seekPercent / 100) * (segment.endTime - segment.startTime);

    // Ensure seek time is within segment boundaries
    const clampedSeekTime = Math.max(
      segment.startTime,
      Math.min(seekTime, segment.endTime - 0.1)
    );
    audio.currentTime = clampedSeekTime;

    const relativeTime = clampedSeekTime - segment.startTime;
    setCurrentTime(relativeTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      data-testid="audio-player"
      className={cn(
        "bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{segment.speakerName}</h4>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Language indicator */}
          {segment.language && segment.language.toLowerCase() !== "english" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-xs">
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                Audio is in {segment.language}
              </span>
              <span className="text-amber-600 dark:text-amber-300">
                (English translation provided below)
              </span>
            </div>
          )}

          <p
            id={`audio-transcript-${segment.testimonyId}`}
            className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2"
          >
            &quot;{segment.transcriptExcerpt}&quot;
          </p>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle
                className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0"
                data-testid="alert-circle-icon"
              />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              disabled={isLoading || !!error}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={
                isLoading
                  ? "Loading audio..."
                  : error
                    ? "Audio unavailable"
                    : isPlaying
                      ? `Pause audio from ${segment.speakerName}`
                      : `Play audio from ${segment.speakerName}`
              }
              aria-describedby={`audio-transcript-${segment.testimonyId}`}
            >
              {isLoading ? (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  data-testid="loader-icon"
                />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={handleSeek}
                disabled={isLoading || !!error}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${progress}%, #d1d5db ${progress}%, #d1d5db 100%)`
                }}
                aria-label={`Audio progress: ${formatTime(currentTime)} of ${formatTime(duration)}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              />
              {isLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  data-testid="progress-loading"
                >
                  <div className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Why this matters:</span>{" "}
            {segment.significance}
          </p>
        </div>
      </div>

      <audio ref={audioRef} src={segment.audioFile} preload="metadata" />
    </div>
  );
}
