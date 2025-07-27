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

/**
 * Testimony entry for carousel display
 */
export interface TestimonyCarouselEntry {
  id?: string;
  survivorName: string;
  excerpt: string;
  fullTranscript?: string;
  location?: string;
  timeReference?: string;
  filename: string;
  url?: string;
}

/**
 * Props for the TestimonyCarousel component
 */
export interface TestimonyCarouselProps {
  status: "result" | "loading";
  name: string;
  sources: TestimonyCarouselEntry[];
}

/**
 * Lexicon entry for carousel display
 */
export interface LexiconCarouselEntry {
  id?: string;
  title: string;
  filename: string;
  pdfUrl?: string | null;
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
