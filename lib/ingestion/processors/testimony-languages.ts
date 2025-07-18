import testimonyLanguages from '../testimony-languages.json';

/**
 * Get the language for a testimony based on the survivor's last name
 */
export function getTestimonyLanguage(survivorName: string): string | undefined {
  // Extract last name and convert to lowercase
  const lastName = survivorName.split(' ').pop()?.toLowerCase();
  if (!lastName) return undefined;

  // Look for matching entry in testimony-languages.json
  const filenameKey = `${lastName}.txt`;
  return testimonyLanguages[filenameKey as keyof typeof testimonyLanguages];
}

/**
 * Convert language name to ISO language code
 */
export function getLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'German': 'de',
    'Yiddish': 'yi', 
    'English': 'en',
    'Spanish': 'es',
    'Polish': 'pl',
    'German & Spanish': 'de', // Default to German for mixed
    'Polish & German': 'de' // Default to German for mixed
  };

  return languageMap[language] || 'en';
}

/**
 * Get testimony metadata including language info
 */
export function getTestimonyMetadata(survivorName: string) {
  const language = getTestimonyLanguage(survivorName);
  const languageCode = language ? getLanguageCode(language) : undefined;
  
  return {
    language,
    languageCode,
    lastName: survivorName.split(' ').pop()?.toLowerCase()
  };
}