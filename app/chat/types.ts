/**
 * Chat feature type definitions
 */

/**
 * Audio segment interface for testimony playback
 */
export interface AudioSegment {
  testimonyId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  transcriptExcerpt: string;
  language?: string;
  significance: string;
  audioFile: string;
  url?: string;
}

/**
 * Props for the AudioPlayer component
 */
export interface AudioPlayerProps {
  segment: AudioSegment;
  className?: string;
}

/**
 * Props for the AudioPlayerSuspense component
 */
export interface AudioPlayerSuspenseProps {
  segment: AudioSegment;
  className?: string;
}

import type { SelectLexiconSource, SelectTestimonySource } from "@/lib/database/schema";

export type LexiconCarouselEntry = SelectLexiconSource;
export type TestimonyCarouselEntry = SelectTestimonySource;

export interface TestimonyCarouselProps {
  status: "result" | "loading";
  name: string;
  sources: TestimonyCarouselEntry[];
}

/**
 * Props for the LexiconCarousel component
 */
export interface LexiconCarouselProps {
  status: "result" | "loading";
  name: string;
  sources: LexiconCarouselEntry[];
}

/**
 * Slide image for Holocaust image slideshow
 */
export interface SlideImage {
  src: string;
  alt: string;
  question: string;
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
}

/**
 * Props for the HolocaustImageSlideshow component
 */
export interface HolocaustImageSlideshowProps {
  onQuestionClick?: (question: string) => void;
}
