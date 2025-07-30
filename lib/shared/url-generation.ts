// Client-safe environment access
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL || "https://zekher.com";
  }

  // Server side - use process.env directly to avoid circular imports
  return process.env.NEXT_PUBLIC_BASE_URL || "https://zekher.com";
}

import type {
  SourceUrlParams,
  AudioUrlParams,
  UrlConfig,
  SpeakerMapping
} from "./types";

/**
 * Simple URL generators for Google Cloud Storage
 */

export function getAudioUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/audio/";
  }

  // Ensure filename has .mp3 extension for audio files
  const mp3Filename = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;

  return `https://storage.googleapis.com/zekher-storage/audio/${mp3Filename}`;
}

export function getLexiconUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/lexicon/pdf/";
  }

  // Ensure filename has .pdf extension
  const pdfFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  return `https://storage.googleapis.com/zekher-storage/lexicon/pdf/${encodeURIComponent(
    pdfFilename
  )}`;
}

export function getTestimonyUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/testimony/";
  }

  return `https://storage.googleapis.com/zekher-storage/testimony/${filename}`;
}

export function getBlobUrl(
  type: "audio" | "lexicon" | "testimony",
  filename: string
): string {
  switch (type) {
    case "audio":
      return getAudioUrl(filename);
    case "lexicon":
      return getLexiconUrl(filename);
    case "testimony":
      return getTestimonyUrl(filename);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

/**
 * Centralized speaker mappings based on testimony.json data
 */
const SPEAKER_MAPPINGS: Record<string, SpeakerMapping> = {
  "Adolph Heisler": {
    fullName: "Adolph Heisler",
    audioFilename: "heisler.mp3",
    testimonyFilename: "adolph-heisler"
  },
  "Alexander Gertner": {
    fullName: "Alexander Gertner",
    audioFilename: "gertner.mp3",
    testimonyFilename: "alexander-gertner"
  },
  "Anna Kaletska": {
    fullName: "Anna Kaletska",
    audioFilename: "kaletska.mp3",
    testimonyFilename: "anna-kaletska"
  },
  "Benjamin Piskorz": {
    fullName: "Benjamin Piskorz",
    audioFilename: "piskorz.mp3",
    testimonyFilename: "benjamin-piskorz"
  },
  "David Lea": {
    fullName: "David Lea",
    audioFilename: "lea.mp3",
    testimonyFilename: "david-lea"
  },
  "Hadassah Marcus": {
    fullName: "Hadassah Marcus",
    audioFilename: "marcus.mp3",
    testimonyFilename: "hadassah-marcus"
  },
  "Helen Tichauer": {
    fullName: "Helen Tichauer",
    audioFilename: "tichauer.mp3",
    testimonyFilename: "helen-tichauer"
  },
  "Henja Frydman": {
    fullName: "Henja Frydman",
    audioFilename: "frydman.mp3",
    testimonyFilename: "henja-frydman"
  },
  "Henry Sochami": {
    fullName: "Henry Sochami",
    audioFilename: "sochami.mp3",
    testimonyFilename: "henry-sochami"
  },
  "Irena Rosenwasser": {
    fullName: "Irena Rosenwasser",
    audioFilename: "rosenwasser.mp3",
    testimonyFilename: "irena-rosenwasser"
  },
  "Jacob Minski": {
    fullName: "Jacob Minski",
    audioFilename: "minski.mp3",
    testimonyFilename: "jacob-minski"
  },
  "Jola Gross": {
    fullName: "Jola Gross",
    audioFilename: "gross.mp3",
    testimonyFilename: "jola-gross"
  },
  "Jürgen Bassfreund": {
    fullName: "Jürgen Bassfreund",
    audioFilename: "bassfreund.mp3",
    testimonyFilename: "jurgen-bassfreund"
  },
  "Kalman Eisenberg": {
    fullName: "Kalman Eisenberg",
    audioFilename: "eisenberg.mp3",
    testimonyFilename: "kalman-eisenberg"
  },
  "Leon Frim": {
    fullName: "Leon Frim",
    audioFilename: "frim.mp3",
    testimonyFilename: "leon-frim"
  },
  "Lina Stumachin": {
    fullName: "Lina Stumachin",
    audioFilename: "stumachin.mp3",
    testimonyFilename: "lina-stumachin"
  },
  "Ludwig Hamburger": {
    fullName: "Ludwig Hamburger",
    audioFilename: "hamburger.mp3",
    testimonyFilename: "ludwig-hamburger"
  },
  "Marko Moskovitz": {
    fullName: "Marko Moskovitz",
    audioFilename: "moskovitz.mp3",
    testimonyFilename: "marko-moskovitz"
  },
  "Max Meyer Sprecher": {
    fullName: "Max Meyer Sprecher",
    audioFilename: "sprecher.mp3",
    testimonyFilename: "max-meyer-sprecher"
  },
  "Nechama Epstein-Kozlowski": {
    fullName: "Nechama Epstein-Kozlowski",
    audioFilename: "epstein-kozlowski.mp3",
    testimonyFilename: "nechama-epstein-kozlowski"
  },
  "Nelly Bondy": {
    fullName: "Nelly Bondy",
    audioFilename: "bondy.mp3",
    testimonyFilename: "nelly-bondy"
  },
  "Pinkhus Rosenfeld": {
    fullName: "Pinkhus Rosenfeld",
    audioFilename: "rosenfeld.mp3",
    testimonyFilename: "pinkhus-rosenfeld"
  },
  "Rita Benmayor": {
    fullName: "Rita Benmayor",
    audioFilename: "benmayor.mp3",
    testimonyFilename: "rita-benmayor"
  },
  "Samuel Isakovitch": {
    fullName: "Samuel Isakovitch",
    audioFilename: "isakovitch.mp3",
    testimonyFilename: "samuel-isakovitch"
  },
  "Toba Schiver": {
    fullName: "Toba Schiver",
    audioFilename: "schiver.mp3",
    testimonyFilename: "toba-schiver"
  },
  "Udel Stopnitsky": {
    fullName: "Udel Stopnitsky",
    audioFilename: "stopnitsky.mp3",
    testimonyFilename: "udel-stopnitsky"
  },
  "Wolf Nehrich": {
    fullName: "Wolf Nehrich",
    audioFilename: "nehrich.mp3",
    testimonyFilename: "wolf-nehrich"
  }
};

import { DEFAULT_URL_CONFIG } from "./config";

/**
 * Validates the URL configuration
 */
export function validateUrlConfig(config: UrlConfig): void {
  if (!config.NEXT_PUBLIC_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is required for URL generation");
  }

  try {
    new URL(config.NEXT_PUBLIC_BASE_URL);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_BASE_URL format: ${config.NEXT_PUBLIC_BASE_URL}`
    );
  }

  if (!config.GOOGLE_CLOUD_STORAGE_BASE) {
    throw new Error("GOOGLE_CLOUD_STORAGE_BASE is required");
  }

  try {
    new URL(config.GOOGLE_CLOUD_STORAGE_BASE);
  } catch {
    throw new Error(
      `Invalid GOOGLE_CLOUD_STORAGE_BASE format: ${config.GOOGLE_CLOUD_STORAGE_BASE}`
    );
  }
}

/**
 * Sanitizes filename for URL usage
 */
export function sanitizeFilename(filename: string): string {
  return (
    filename
      .toLowerCase()
      // Convert common Unicode characters to ASCII equivalents
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ä/g, "a")
      .replace(/ß/g, "ss")
      .replace(/ç/g, "c")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ê/g, "e")
      .replace(/ë/g, "e")
      .replace(/à/g, "a")
      .replace(/á/g, "a")
      .replace(/â/g, "a")
      .replace(/ã/g, "a")
      .replace(/å/g, "a")
      .replace(/í/g, "i")
      .replace(/ì/g, "i")
      .replace(/î/g, "i")
      .replace(/ï/g, "i")
      .replace(/ó/g, "o")
      .replace(/ò/g, "o")
      .replace(/ô/g, "o")
      .replace(/õ/g, "o")
      .replace(/ø/g, "o")
      .replace(/ú/g, "u")
      .replace(/ù/g, "u")
      .replace(/û/g, "u")
      .replace(/ý/g, "y")
      .replace(/ÿ/g, "y")
      .replace(/ñ/g, "n")
      // Replace special characters between word characters with dashes
      .replace(/([a-z0-9])[^a-z0-9\s\-_.]+([a-z0-9])/g, "$1-$2")
      // Remove any remaining non-ASCII characters
      .replace(/[^a-z0-9\s\-_.]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

/**
 * Extracts last name from full name for filename generation
 */
export function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Generates consistent source URLs for citations
 */
export function generateSourceUrl(params: SourceUrlParams): string {
  const config = DEFAULT_URL_CONFIG;

  try {
    validateUrlConfig(config);

    const {
      pageType,
      filename,
      baseUrl = config.NEXT_PUBLIC_BASE_URL
    } = params;

    // Validate pageType
    if (!["lexicon", "testimony"].includes(pageType)) {
      const error = new Error(
        `Invalid pageType: ${pageType}. Must be 'lexicon' or 'testimony'`
      );

      // Import monitoring dynamically to avoid circular dependency
      import("@/lib/monitoring")
        .then(({ trackCitationUrlGeneration, ErrorType }) => {
          trackCitationUrlGeneration({
            pageType: pageType as "lexicon" | "testimony",
            filename,
            success: false,
            errorType: ErrorType.URL_VALIDATION,
            errorMessage: error.message
          });
        })
        .catch(() => {
          // Fallback logging if monitoring import fails
          console.error("Citation URL generation failed:", error.message);
        });

      throw error;
    }

    // For database IDs, no sanitization needed (they're already URL-safe)
    // Only sanitize if it looks like a title/name rather than an ID
    const sanitizedFilename =
      filename.includes(" ") || filename.includes(".")
        ? sanitizeFilename(filename)
        : filename;

    if (!sanitizedFilename) {
      const error = new Error("Filename cannot be empty after sanitization");

      // Import monitoring dynamically to avoid circular dependency
      import("@/lib/monitoring")
        .then(({ trackCitationUrlGeneration, ErrorType }) => {
          trackCitationUrlGeneration({
            pageType,
            filename,
            success: false,
            errorType: ErrorType.URL_VALIDATION,
            errorMessage: error.message
          });
        })
        .catch(() => {
          // Fallback logging if monitoring import fails
          console.error("Citation URL generation failed:", error.message);
        });

      throw error;
    }

    // Construct URL with new route structure
    const generatedUrl = `${baseUrl}/sources/${pageType}/${sanitizedFilename}`;

    // Track successful URL generation
    import("@/lib/monitoring")
      .then(({ trackCitationUrlGeneration }) => {
        trackCitationUrlGeneration({
          pageType,
          filename,
          success: true,
          generatedUrl
        });
      })
      .catch(() => {
        // Fallback logging if monitoring import fails
        // console.log("Citation URL generated successfully:", generatedUrl);
      });

    return generatedUrl;
  } catch (error) {
    // Track validation errors
    import("@/lib/monitoring")
      .then(({ trackUrlValidationError, ErrorType, Severity }) => {
        trackUrlValidationError(
          `${params.pageType}/${params.filename}`,
          ErrorType.CITATION_URL_GENERATION,
          error instanceof Error ? error.message : "Unknown error",
          Severity.HIGH
        );
      })
      .catch(() => {
        // Fallback logging if monitoring import fails
        console.error("Citation URL generation validation failed:", error);
      });

    throw error;
  }
}

/**
 * Generates audio URLs with fallback chain
 */
export function generateAudioUrl(params: AudioUrlParams): string {
  const config = DEFAULT_URL_CONFIG;
  validateUrlConfig(config);

  const { speakerName, fallbackFilename } = params;

  if (!speakerName?.trim()) {
    throw new Error("Speaker name is required for audio URL generation");
  }

  // Check for explicit mapping first
  const mapping = SPEAKER_MAPPINGS[speakerName];
  let audioFilename: string;

  if (mapping) {
    audioFilename = mapping.audioFilename;
  } else if (fallbackFilename) {
    audioFilename = fallbackFilename;
  } else {
    // Generate filename from last name
    const lastName = extractLastName(speakerName);
    audioFilename = `${lastName}.mp3`;
  }

  // Generate Google Cloud Storage URL
  return getBlobUrl("audio", audioFilename);
}

/**
 * Gets the mapped filename for a speaker (for testimony references)
 */
export function getTestimonyFilename(speakerName: string): string {
  const mapping = SPEAKER_MAPPINGS[speakerName];
  if (mapping) {
    return mapping.testimonyFilename;
  }

  // Generate from speaker name as fallback
  return sanitizeFilename(speakerName);
}

/**
 * Gets the audio filename for a speaker
 */
export function getAudioFilename(speakerName: string): string {
  const mapping = SPEAKER_MAPPINGS[speakerName];
  if (mapping) {
    return mapping.audioFilename;
  }

  // Generate from last name as fallback
  const lastName = extractLastName(speakerName);
  return `${lastName}.mp3`;
}

/**
 * Adds or updates a speaker mapping
 */
export function addSpeakerMapping(mapping: SpeakerMapping): void {
  SPEAKER_MAPPINGS[mapping.fullName] = mapping;
}

/**
 * Gets all current speaker mappings
 */
export function getSpeakerMappings(): Record<string, SpeakerMapping> {
  return { ...SPEAKER_MAPPINGS };
}

/**
 * Generates lexicon PDF URLs from database filenames
 */
export function generateLexiconPdfUrl(filename: string): string {
  const config = DEFAULT_URL_CONFIG;
  validateUrlConfig(config);

  if (!filename?.trim()) {
    throw new Error("Filename is required for lexicon PDF URL generation");
  }

  // Convert database filename to PDF filename
  // Database stores .txt filenames, but PDFs have same base name with .pdf extension
  const baseFilename = filename.replace(/\.(txt|pdf)$/i, "");

  // Keep the filename as-is (PDFs are stored with same format as titles)
  const pdfFilename = `${baseFilename}.pdf`;

  // Generate Google Cloud Storage URL
  return getBlobUrl("lexicon", pdfFilename);
}

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironment(): void {
  try {
    // Get fresh environment configuration for validation
    validateUrlConfig(DEFAULT_URL_CONFIG);
  } catch (error) {
    throw new Error(
      `Environment validation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
