import { TranslationServiceClient } from "@google-cloud/translate";
import { NextRequest, NextResponse } from "next/server";

// Instantiates a client
const translationClient = new TranslationServiceClient();

const projectId = "gen-lang-client-0418505604";
const location = "global";

// Language name to Google Translate language code mapping
function mapLanguageToCode(language: string | undefined): string | undefined {
  if (!language) return undefined;
  
  const languageMap: { [key: string]: string } = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'polish': 'pl',
    'dutch': 'nl',
    'swedish': 'sv',
    'danish': 'da',
    'norwegian': 'no',
    'finnish': 'fi',
    'hungarian': 'hu',
    'czech': 'cs',
    'slovak': 'sk',
    'romanian': 'ro',
    'bulgarian': 'bg',
    'croatian': 'hr',
    'serbian': 'sr',
    'slovenian': 'sl',
    'ukrainian': 'uk',
    'lithuanian': 'lt',
    'latvian': 'lv',
    'estonian': 'et',
    'hebrew': 'he',
    'yiddish': 'yi',
    'arabic': 'ar',
    'turkish': 'tr',
    'greek': 'el',
    'chinese': 'zh',
    'japanese': 'ja',
    'korean': 'ko',
    'hindi': 'hi',
    'urdu': 'ur',
    'persian': 'fa',
    'farsi': 'fa',
    'thai': 'th',
    'vietnamese': 'vi',
    'indonesian': 'id',
    'malay': 'ms',
    'tagalog': 'tl',
    'filipino': 'tl'
  };
  
  const normalizedLanguage = language.toLowerCase().trim();
  return languageMap[normalizedLanguage];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage = "en", sourceLanguage } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required for translation" },
        { status: 400 }
      );
    }

    // Map source language to proper language code
    const mappedSourceLanguage = mapLanguageToCode(sourceLanguage);
    
    // Construct request - omit sourceLanguageCode if invalid to let Google auto-detect
    const translationRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain" as const,
      ...(mappedSourceLanguage && { sourceLanguageCode: mappedSourceLanguage }),
      targetLanguageCode: targetLanguage,
    };

    // Run request
    const [response] = await translationClient.translateText(translationRequest);
    
    const translatedText = response.translations?.[0]?.translatedText;
    const detectedLanguage = response.translations?.[0]?.detectedLanguageCode;

    return NextResponse.json({
      translatedText,
      detectedLanguage,
      sourceLanguage: mappedSourceLanguage || detectedLanguage,
      originalSourceLanguage: sourceLanguage,
      targetLanguage,
    });
  } catch (error) {
    console.error("Error during translation:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}