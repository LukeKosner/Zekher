import { Translate } from '@google-cloud/translate/build/src/v2';
import { getGCPCredentials } from '@/lib/shared/config';

let translateClient: Translate | null = null;

/**
 * Get or create Google Cloud Translation client
 */
export function getTranslateClient(): Translate {
  if (!translateClient) {
    translateClient = new Translate(getGCPCredentials());
  }
  return translateClient;
}

/**
 * Translate text to a target language
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  try {
    const translate = getTranslateClient();
    
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect the language of given text
 */
export async function detectLanguage(text: string): Promise<{
  language: string;
  confidence: number;
}> {
  try {
    const translate = getTranslateClient();
    
    const [detection] = await translate.detect(text);
    
    return {
      language: detection.language,
      confidence: detection.confidence || 0,
    };
  } catch (error) {
    console.error('Language detection error:', error);
    throw new Error(`Failed to detect language: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get list of supported languages
 */
export async function getSupportedLanguages(targetLanguage = 'en'): Promise<Array<{
  code: string;
  name: string;
}>> {
  try {
    const translate = getTranslateClient();
    
    const [languages] = await translate.getLanguages(targetLanguage);
    
    return languages.map(lang => ({
      code: lang.code,
      name: lang.name,
    }));
  } catch (error) {
    console.error('Error getting supported languages:', error);
    throw new Error(`Failed to get supported languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}