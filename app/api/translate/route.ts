import { NextRequest, NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";
import * as Sentry from "@sentry/nextjs";
import { getGCPCredentials } from "@/lib/shared/config";

const { logger } = Sentry;

// Initialize the Google Cloud Translation client with credentials
const translationClient = new TranslationServiceClient(getGCPCredentials());

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage = "en", sourceLanguage } = await req.json();

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return NextResponse.json(
        { error: "Target language is required and must be a string" },
        { status: 400 }
      );
    }

    // If source language is English and target is English, return as-is
    if (sourceLanguage?.toLowerCase() === "english" && targetLanguage === "en") {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage: "en",
        targetLanguage: "en"
      });
    }

    // If text is very short, might not need translation
    if (text.trim().length < 3) {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage: sourceLanguage || "unknown",
        targetLanguage: targetLanguage
      });
    }

    // Get project ID from environment - try multiple possible env vars
    const projectId = process.env.GCP_PROJECT_ID || 
                     process.env.GOOGLE_CLOUD_PROJECT_ID || 
                     process.env.GOOGLE_CLOUD_PROJECT ||
                     process.env.GCP_PROJECT ||
                     process.env.PROJECT_ID;
                     
    if (!projectId) {
      logger.error("Google Cloud Project ID not configured. Please set GOOGLE_CLOUD_PROJECT_ID environment variable.");
      return NextResponse.json(
        { error: "Translation service not configured" },
        { status: 500 }
      );
    }

    // Construct the translation request
    const translationRequest = {
      parent: `projects/${projectId}/locations/global`,
      contents: [text],
      mimeType: "text/plain",
      sourceLanguageCode: sourceLanguage ? mapLanguageToCode(sourceLanguage) : undefined,
      targetLanguageCode: targetLanguage,
    };

    // Perform the translation
    const [response] = await translationClient.translateText(translationRequest);

    if (!response.translations || response.translations.length === 0) {
      logger.error("No translations returned from Google Cloud Translation");
      return NextResponse.json(
        { error: "Translation failed - no results returned" },
        { status: 500 }
      );
    }

    const translation = response.translations[0];
    
    return NextResponse.json({
      translatedText: translation.translatedText,
      sourceLanguage: translation.detectedLanguageCode || sourceLanguage,
      targetLanguage: targetLanguage
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error("Translation error occurred", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    Sentry.captureException(error, {
      tags: { 
        component: "translation-api",
        operation: "translateText" 
      }
    });

    // Provide more specific error messages for common issues
    if (errorMessage.includes("credentials") || errorMessage.includes("authentication")) {
      return NextResponse.json(
        { error: "Translation service authentication error" },
        { status: 503 }
      );
    }

    if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
      return NextResponse.json(
        { error: "Translation service quota exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Translation service temporarily unavailable" },
      { status: 500 }
    );
  }
}

/**
 * Map common language names to ISO language codes
 */
function mapLanguageToCode(language: string): string {
  const languageMap: Record<string, string> = {
    "english": "en",
    "spanish": "es", 
    "french": "fr",
    "german": "de",
    "italian": "it",
    "portuguese": "pt",
    "russian": "ru",
    "chinese": "zh",
    "japanese": "ja",
    "korean": "ko",
    "arabic": "ar",
    "hebrew": "he",
    "polish": "pl",
    "czech": "cs",
    "hungarian": "hu",
    "romanian": "ro",
    "dutch": "nl",
    "swedish": "sv",
    "norwegian": "no",
    "danish": "da",
    "finnish": "fi",
    "greek": "el",
    "turkish": "tr",
    "ukrainian": "uk",
    "bulgarian": "bg",
    "croatian": "hr",
    "slovak": "sk",
    "slovenian": "sl",
    "lithuanian": "lt",
    "latvian": "lv",
    "estonian": "et"
  };

  const normalizedLanguage = language.toLowerCase().trim();
  return languageMap[normalizedLanguage] || normalizedLanguage;
}