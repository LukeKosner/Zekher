import blobUrls from "./blob-urls.json";

export interface BlobUrls {
  audio: Record<string, string>;
  lexicon: Record<string, string>;
  testimony: Record<string, string>;
}

/**
 * Validates the blob URL configuration format
 */
export function validateBlobUrlConfig(config: unknown): config is BlobUrls {
  if (!config || typeof config !== "object") {
    return false;
  }

  const obj = config as Record<string, unknown>;

  // Check required top-level properties
  if (!("audio" in obj) || !("lexicon" in obj) || !("testimony" in obj)) {
    return false;
  }

  // Validate each section is an object with string values
  const sections = ["audio", "lexicon", "testimony"] as const;
  for (const section of sections) {
    const sectionData = obj[section];
    if (
      !sectionData ||
      typeof sectionData !== "object" ||
      Array.isArray(sectionData)
    ) {
      return false;
    }

    // Check all values are strings (URLs)
    for (const [key, value] of Object.entries(
      sectionData as Record<string, unknown>
    )) {
      if (typeof key !== "string" || typeof value !== "string") {
        return false;
      }

      // Basic URL format validation
      if (value && !isValidUrl(value)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Basic URL validation helper
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely loads and validates blob URL configuration
 */
function loadBlobUrlConfig(): BlobUrls {
  try {
    if (!validateBlobUrlConfig(blobUrls)) {
      const errorMessage =
        "Invalid blob URL configuration format, using empty fallback";
      console.warn(errorMessage);

      // Track configuration error
      import("./monitoring")
        .then(({ trackBlobUrlConfigError }) => {
          trackBlobUrlConfigError(errorMessage, "validation");
        })
        .catch(() => {
          // Fallback logging if monitoring import fails
          console.warn("Blob URL config validation failed");
        });

      return {
        audio: {},
        lexicon: {},
        testimony: {}
      };
    }
    return blobUrls as BlobUrls;
  } catch (error) {
    const errorMessage = `Failed to load blob URL configuration: ${error instanceof Error ? error.message : "Unknown error"}`;
    console.warn(errorMessage);

    // Track loading error
    import("./monitoring")
      .then(({ trackBlobUrlConfigError }) => {
        trackBlobUrlConfigError(errorMessage, "loading");
      })
      .catch(() => {
        // Fallback logging if monitoring import fails
        console.warn("Blob URL config loading failed:", error);
      });

    return {
      audio: {},
      lexicon: {},
      testimony: {}
    };
  }
}

const typedBlobUrls: BlobUrls = loadBlobUrlConfig();

export function getAudioUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/audio/";
  }

  // Ensure filename has .mp3 extension for audio files
  const mp3Filename = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;

  return (
    typedBlobUrls.audio[mp3Filename] ||
    typedBlobUrls.audio[filename] ||
    `https://storage.googleapis.com/zekher-storage/audio/${mp3Filename}`
  );
}

export function getLexiconUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/lexicon/pdf/";
  }

  // Ensure filename has .pdf extension
  const pdfFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  return (
    typedBlobUrls.lexicon[pdfFilename] ||
    typedBlobUrls.lexicon[filename] ||
    `https://storage.googleapis.com/zekher-storage/lexicon/pdf/${encodeURIComponent(pdfFilename)}`
  );
}

export function getTestimonyUrl(filename: string): string {
  // Handle null, undefined, or empty filename
  if (!filename || filename.trim() === "") {
    return "https://storage.googleapis.com/zekher-storage/testimony/";
  }

  return (
    typedBlobUrls.testimony[filename] ||
    `https://storage.googleapis.com/zekher-storage/testimony/${filename}`
  );
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
