"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Languages,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import type { AudioSegment, AudioPlayerProps } from "../types";

const { logger } = Sentry;

/**
 * Map language codes to human-readable names
 */
function getLanguageName(languageCode: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    pl: "Polish",
    cs: "Czech",
    hu: "Hungarian",
    ro: "Romanian",
    nl: "Dutch",
    sv: "Swedish",
    no: "Norwegian",
    da: "Danish",
    fi: "Finnish",
    el: "Greek",
    tr: "Turkish",
    uk: "Ukrainian",
    bg: "Bulgarian",
    hr: "Croatian",
    sk: "Slovak",
    sl: "Slovenian",
    lt: "Lithuanian",
    lv: "Latvian",
    et: "Estonian",
    he: "Hebrew",
    ar: "Arabic",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean"
  };

  // Handle the case where language is already a full name
  if (languageCode && languageCode.length > 3) {
    return languageCode;
  }

  const normalizedCode = languageCode?.toLowerCase().trim();
  return languageMap[normalizedCode] || languageCode || "Unknown";
}

export function AudioPlayer({ segment, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

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

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: segment.transcriptExcerpt,
          targetLanguage: "en",
          sourceLanguage:
            segment.language?.toLowerCase() === "english"
              ? undefined
              : segment.language
        })
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setShowTranslation(true);
    } catch (error) {
      setTranslationError("Translation failed. Please try again.");
      logger.error("Translation error occurred", {
        error: error instanceof Error ? error.message : String(error),
        testimonyId: segment.testimonyId,
        speakerName: segment.speakerName
      });
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: {
            component: "audio-player",
            operation: "translation"
          },
          extra: {
            testimonyId: segment.testimonyId,
            speakerName: segment.speakerName
          }
        }
      );
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      data-testid="audio-player"
      className={cn("rounded-md border bg-muted/30 p-3 space-y-3", className)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {segment.testimonyId ? (
              <Link
                href={`/sources/testimony/${segment.testimonyId}`}
                className="hover:text-blue-600 transition-colors"
              >
                {segment.speakerName}
              </Link>
            ) : (
              segment.speakerName
            )}
          </h3>
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Language indicator */}
        {segment.language &&
          segment.language.toLowerCase() !== "english" &&
          getLanguageName(segment.language).toLowerCase() !== "english" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-xs">
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                Audio is in {getLanguageName(segment.language)}
              </span>
            </div>
          )}

        <div className="space-y-2">
          <p
            id={`audio-transcript-${segment.testimonyId}`}
            className="text-xs text-muted-foreground italic whitespace-pre-wrap"
          >
            &quot;{segment.transcriptExcerpt}&quot;
          </p>

          {/* Translation Button */}
          {segment.language &&
            segment.language.toLowerCase() !== "english" &&
            getLanguageName(segment.language).toLowerCase() !== "english" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranslating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Languages className="w-3 h-3" />
                  )}
                  {translatedText ? (
                    <>
                      <span>
                        {showTranslation ? "Hide" : "Show"} Translation
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${showTranslation ? "rotate-180" : ""}`}
                      />
                    </>
                  ) : (
                    <span>Use Machine Translate</span>
                  )}
                </button>
              </div>
            )}

          {/* Translation Display */}
          {showTranslation && translatedText && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                English Translation:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                &quot;{translatedText}&quot;
              </p>
            </div>
          )}

          {/* Translation Error */}
          {translationError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">
                {translationError}
              </p>
            </div>
          )}
        </div>

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

        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Why this matters:</span>{" "}
          {segment.significance}
        </p>

        {/* Citation links */}
        <div className="pt-2  dark:border-gray-700">
          <p className="text-xs text-gray-500">
            {segment.url && (
              <>
                <Link
                  href={segment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                >
                  David P. Boder Collection
                </Link>
              </>
            )}
            {segment.testimonyId && (
              <>
                {" • "}
                <Link
                  href={`/sources/testimony/${segment.testimonyId}`}
                  className="hover:text-blue-600 transition-colors underline"
                >
                  Full Testimony
                  <ExternalLink className="inline size-3 ml-1" />
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <audio ref={audioRef} src={segment.audioFile} preload="metadata" />
    </div>
  );
}
